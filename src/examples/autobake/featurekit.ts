/* eslint-disable no-constant-condition */
import claude from "@anthropic-ai/tokenizer/claude.json" assert { type: "json" };
import { InputValues, NodeValue, OutputValues, addKit, asRuntimeKit } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import { Tiktoken, TiktokenBPE } from "js-tiktoken";
import * as puppeteer from "puppeteer";
import { Browser, JSHandle, Page } from "puppeteer";
import * as readline from 'readline/promises';
import { chromeVersions } from "./chromeVersions.js";
import chromeStatusApiFeatures, { ChromeStatusV1ApiFeature } from "./chromeStatusApiFeatures.js";
import chromeStatusFeaturesV2 from "./chromeStatusFeaturesV2.js";
import { list } from "@exadev/breadboard-kits/types";
import fs from "fs";


export function getTokenizer(): Tiktoken {
	const tiktokenBPE: TiktokenBPE = {
		pat_str: claude.pat_str,
		special_tokens: claude.special_tokens,
		bpe_ranks: claude.bpe_ranks,
	};
	return new Tiktoken(tiktokenBPE);
}

type pageContents = {
	contents: NodeValue
};

type feature = {
	id: NodeValue,
	name: NodeValue,
	summary: NodeValue,
	category: NodeValue,
	docs: NodeValue[],
	samples: NodeValue[]
};

const TOKEN_LIMIT: number = 99_000;

type featureDocuments = NodeValue

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function countTokens(text: string): number {
	const tokenizer = getTokenizer();
	const encoded = tokenizer.encode(text.normalize("NFKC"));
	return encoded.length;
}

export async function extractContents(url: string): Promise<pageContents> {
	const browser: Browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox'],
		ignoreDefaultArgs: ['--disable-extensions']
	});
	const page: Page = await browser.newPage();

	console.log("Extracting Feature Resources: ", url);

	await page.goto(url, { waitUntil: 'load' });
	// sleep because some page elements might not immediately render
	await sleep(5000);
	const element: JSHandle = await page.evaluateHandle(`document.querySelector("body")`);

	let contents = await page.evaluate((el: any) => el.textContent, element);
	contents = contents.replace(/[\n\r]/g, "");

	await browser.close();

	return Promise.resolve({ contents });
}

async function extractFeatureResource(id: string): Promise<pageContents> {
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox'],
		ignoreDefaultArgs: ['--disable-extensions']
	});
	const page = await browser.newPage();

	const baseURL = "https://chromestatus.com/feature/"
	const featureURL = `${baseURL}${id}`;
	console.log("Extracting Feature Content: ", featureURL);

	await page.goto(featureURL, { waitUntil: 'load' });
	// sleep to wait for page to render
	await sleep(5000);
	const element = await page.evaluateHandle(`document.querySelector("body > chromedash-app").shadowRoot.querySelector("#content-component-wrapper > chromedash-feature-page").shadowRoot.querySelector("sl-details")`);

	let contents = await page.evaluate((el: any) => el.textContent, element);

	contents = contents.replace(/[\n\r]/g, "");

	await browser.close();

	return Promise.resolve({ contents });
}

async function test2() {
	const userInput = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	const answer = await userInput.question('Please select a feature id to extract: ');
	console.log(answer)
}

async function getFeatureResources(input: InputValues): Promise<OutputValues> {
	const { list }: list.List = input as list.List;
	const featuresMap = new Map<string, feature>();
	for (const json of list["features"]) {
		const feature = {
			id: json["id"],
			name: json["name"],
			summary: json["summary"],
			category: json["category"],
			docs: json["resources"]["docs"],
			samples: json["resources"]["samples"]
		};

		featuresMap.set(`${json["id"]}`, feature);

	}
	const userInput = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const featureResources: featureDocuments[] = [];

	try {
		while (true) {
			const answer = await userInput.question('Please select a feature id to extract: ');
			if (featuresMap.has(answer)) {
				const webContent = await extractFeatureResource(answer);
				featureResources.push(webContent["contents"]);

				const feature = featuresMap.get(answer);
				const featureDocs = feature!["docs"];
				const featureSamples = feature!["samples"];

				// extract documentation contents
				for (const doc of featureDocs) {
					const webContent = await extractContents(doc as string)
					featureResources.push(webContent["contents"]);
				}
				// extract samples content
				for (const sample of featureSamples) {
					const webContent = await extractContents(sample as string)
					featureResources.push(webContent["contents"]);
				}

				// Claude has token limit, keep trimming each document until we are below the token limit
				// set to 99,000 as extra tokens will be added when constructing hte prompt
				// maybe trim the larger documents with a different coefficient? 20% of a large document might lose
				// a lot of useful information
				while (true) {
					let tokenCount = 0
					for (let i = 0; i < featureResources.length; i++) {
						tokenCount += countTokens(featureResources[i] as string);
					}

					if (tokenCount >= TOKEN_LIMIT) {
						for (let i = 0; i < featureResources.length; i++) {
							// only keep 80% of the current content
							// there's probably a better way to do that, but it's difficult to know the structure of the HTML because it all comes from different sources
							featureResources[i] = (featureResources[i] as string).substring(0, (featureResources[i] as string).length * 0.8);
						}
					} else {
						break;
					}
				}
				const outputBuffer = [];
				const baseURL = "https://chromestatus.com/feature/"
				outputBuffer.push({ url: `${baseURL}${answer}`, content: featureResources });
				// write all extracted content to file
				fs.writeFileSync(
					"./featureContent.json",
					JSON.stringify(outputBuffer, null, 2)
				);
				break
			} else {
				console.log("Feature Id does not exist, please check input")
			}
		}
	} finally {
		userInput.close();
	}
	return Promise.resolve({ featureResources });
}

async function getResourcesForFeature({ feature }: InputValues & { feature: ChromeStatusV1ApiFeature }): Promise<OutputValues> {
	const featureId = feature.id
	const featureDocs = feature.resources.docs
	const featureSamples = feature.resources.samples
	const resources: featureDocuments[] = []

	// extract feature content
	const webContent = await extractFeatureResource(featureId.toString())
	resources.push(webContent["contents"])

	// extract documentation contents
	for (const doc of featureDocs) {
		const webContent = await extractContents(doc as string)
		resources.push(webContent["contents"])
	}

	// extract samples content
	for (const sample of featureSamples) {
		const webContent = await extractContents(sample as string)
		resources.push(webContent["contents"])
	}

	let documentTokens: number[] = []
	const getTokenCounts = () => {
		documentTokens = resources.map(r => {
			return countTokens(r as string);
		})
		return documentTokens
	}
	getTokenCounts()
	let totalTokens = () => documentTokens.reduce((a, b) => a + b, 0)
	while (totalTokens() > TOKEN_LIMIT) {
		const difference = totalTokens() - TOKEN_LIMIT
		for (let i = 0; i < resources.length; i++) {
			const docTokens = documentTokens[i]
			const proportionOfAllTokens: number = Math.ceil(docTokens / totalTokens());
			const tokensToDrop: number = proportionOfAllTokens * difference;
			const endIndex: number = (resources[i] as string).length - tokensToDrop;
			resources[i] = (resources[i] as string).substring(0, endIndex)
		}
		getTokenCounts()
	}
	return Promise.resolve({ resources });
}

const featureKit = new KitBuilder({
	url: "."
}).build({
	versions: async () => (
		{
			output: await chromeVersions()
		}),
	chromeStatusApiFeatures: async () => (
		{
			output: await chromeStatusApiFeatures()
		}
	),
	chromeStatusApiFeaturesV2: async () => ({
		output: await chromeStatusFeaturesV2()
	}),
	getFeatureResources: async (input) => ({
		output: await getFeatureResources(input)
	}),
	getResourcesForFeature: async (feature) => (
		{
			output: await getResourcesForFeature(feature as { feature: ChromeStatusV1ApiFeature })
		})
})

export default featureKit;