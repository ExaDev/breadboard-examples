#!/usr/bin/env tsx

import {
	BoardRunner,
	InputValues,
	Probe,
	ProbeMessage,
	asRuntimeKit,
	base,
	board,
	code,
} from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import Core, { core } from "@google-labs/core-kit";
import TemplateKit, { templates } from "@google-labs/template-kit";
import fs from "fs";
import path from "path";
import { merMake } from "../../util/merMake.ts";

const pop = code((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		// return {};
		const list = inputs.list;
		const item = list.pop();
		return { item, list };
	}
	return {};
});

const shift = code<{ list: InputValues[] }>((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		const list = inputs.list;
		const item = list.shift();
		return { item, list };
	}
	return {};
});

const concat = code<{ list: unknown[]; concat: unknown[] }>((inputs) => {
	if (Array.isArray(inputs.list) && Array.isArray(inputs.concat)) {
		return {
			list: inputs.list.concat(inputs.concat),
		};
	} else {
		throw new Error("inputs are not arrays");
	}
});

const pickAndSpread = code<{ key: string; object: any }>(
	({ key = "key", object }) => {
		// const key = inputs.key;
		if (typeof object !== "object") {
			throw new Error(`object is of type ${typeof object} not object`);
		}
		if (!(key in object)) {
			throw new Error(
				`key ${key} not in object, keys are ${Object.keys(object)}`
			);
		}
		const value = object[key];
		return { ...value };
	}
);

const spread = code<{ object: object }>((inputs) => {
	const object = inputs.object;
	if (typeof object !== "object") {
		throw new Error(`object is of type ${typeof object} not object`);
	}
	return { ...object };
});

const pages = code<{ count: number; per_page: number }>((inputs) => {
	const { count, per_page } = inputs;
	const pages = Math.ceil(count / per_page);
	return { pages };
});

// const stringJoin = code((inputs) => {
// 	// if separator is not provided, it defaults to ""
// 	const { separator = "", ...rest } = inputs;
// 	return {
// 		result: Object.values(rest)
// 			.map((v: any) => v.toString())
// 			.join(separator as string),
// 	};
// });
const stringJoin = code<
	{ left: string; right: string; separator: string },
	{ result: string }
>((inputs) => {
	const { left, right, separator = "" } = inputs;
	return {
		result: [left, right].join(separator),
	};
});

const nextPageNo = code<{
	page?: number;
	per_page: number;
	count: number;
}>(({ page = 1, count, per_page = 200 }) => {
	// const { page, per_page, count } = inputs;
	// final page is the last page
	const finalPage = Math.ceil(count / per_page);
	const nextPage = page + 1;
	if (nextPage > finalPage) {
		return {};
	}
	return { page: nextPage, per_page, count };
});

const calculateTotalPages = code<{ count: number; per_page: number }>(
	(inputs) => {
		const { count, per_page } = inputs;
		return { totalPages: Math.ceil(count / per_page) };
	}
);

const increment = code<{ value: number }>((inputs) => {
	const { value } = inputs;
	return { value: value + 1 };
});

// const pagesArray = code<{ count: number; per_page: number }>((inputs) => {
// 	const { count, per_page } = inputs;
// 	const pages = Math.ceil(count / per_page);
// 	return { pages: Array.from({ length: pages }, (_, i) => i + 1) };
// });

const pagesArray = code<{
	count: number;
	per_page: number;
	page?: number;
	// }>(({ count, per_page, page = 1 }) => {
}>((inputs) => {
	const { count, per_page, page = 1 } = inputs;
	const pages = Math.ceil(count / per_page);
	const start = page;
	const end = pages;
	return {
		pages: Array.from({ length: end - start + 1 }, (_, i) => i + start),
	};
});

const b = board((inputs) => {
	// const openAlexSearchUrl = templates.urlTemplate({
	// 	$id: "makeURL",
	// 	template:
	// 		"https://api.openalex.org/works?search={search}&page={page}&per_page={per_page}&select={select}",
	// 	// per_page: 1,
	// 	// page: inputs.page,
	// 	select: "id",
	// 	// search: inputs.search,
	// });

	// const fetch = core.fetch({
	// 	// $id: "fetch",
	// 	method: "GET",
	// });

	// const output = base.output();

	// inputs.search.to(openAlexSearchUrl);
	// calculateNextPage({
	// 	$id: "firstPage",
	// }).to(openAlexSearchUrl);
	// openAlexSearchUrl.url.to(output);

	// openAlexSearchUrl.to(fetch);
	// // fetch.response.to(output);

	// // const response = fetch.response.as("object").to(spread({}));
	// const response = spread({
	// 	$id: "response",
	// 	object: fetch.response,
	// });
	// // response.to(output);
	// response.meta.to(output);

	// // const meta = response.meta.as("object").to(spread({}));
	// const meta = spread({
	// 	$id: "meta",
	// 	object: response.meta,
	// });
	// // meta.to(output);

	// const getNextPage = meta.to(
	// 	calculateNextPage({
	// 		$id: "nextPage",
	// 	})
	// );
	// const nextPage = templates.urlTemplate({
	// 	$id: "nextPageUrl",
	// 	template:
	// 		"https://api.openalex.org/works?search={search}&page={page}&per_page={per_page}&select={select}",
	// 	// per_page: getNextPage.per_page,
	// 	// page: getNextPage.page,
	// 	select: "id",
	// 	search: inputs.search,
	// });
	// getNextPage.page.to(nextPage);
	// getNextPage.per_page.to(nextPage);
	// nextPage.url.to(output);
	// // nextPage.url.to(output);
	// nextPage.url.to(fetch);

	// const accumulate = concat({ $id: "accumulate", list: [] });
	// // openAlexSearchUrl.to(accumulate);

	// return output;
	// return base.output();

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// const done = base.output();
	// const nextPage = nextPageNo({
	// 	$id: "nextPage",
	// 	page: 1,
	// 	per_page: 10,
	// 	count: 100,
	// });

	// nextPage.page.to(nextPage);
	// nextPage.per_page.to(nextPage);
	// nextPage.count.to(nextPage);

	// nextPage.page.to(output);
	// nextPage.count.to(output);
	// nextPage.count.to(output);
	// nextPage.done.to(done);
	// done.done.to(output);
	// inputs.search.to(nextPage);
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	const output = base.output({ $id: "main" });
	// const pages = pagesArray({
	// 	$id: "pages",
	// 	count: 100,
	// 	per_page: 10,
	// 	page: 3,
	// });
	// // inputs.search.to(pages);
	// // pages.page.to(output);
	// pages.to(base.output({ $id: "pages" }));

	// const invokeShift = shift({ $id: "shift" });
	// pages.pages.as("list").to(invokeShift);

	// invokeShift.list.to(invokeShift);

	// const page = base.output();
	// invokeShift.item.as("page").to(page);
	// page.page.to(output);

	const urlTemplate = templates.urlTemplate({
		$id: "urlTemplate",
		template:
			"https://api.openalex.org/works?search={search}&page={page}&per_page={per_page}&select={select}",
		per_page: 10,
		page: 1,
		select: "id,display_name,title,relevance_score",
		// search: inputs.search,
	});
	inputs.to(urlTemplate);

	// const inputsPassThrough = base.output({
	// $id: "inputsPassThrough",
	// schema: {
	// 	type: "object",
	// 	properties: {
	// 		search: { type: "string" },
	// 		per_page: { type: "number" },
	// 		page: { type: "number" },
	// 	},
	// },
	// });
	// inputs.to(inputsPassThrough);
	// inputs.page.to(inputsPassThrough);
	// inputs.per_page.to(inputsPassThrough);
	// inputs.search.to(inputsPassThrough);
	// inputsPassThrough.to(output);
	// inputsPassThrough.to(urlTemplate);
	// inputsPassThrough.search.to(urlTemplate);
	// inputsPassThrough.per_page.to(urlTemplate);
	urlTemplate.url.to(output);
	// inputsPassThrough.search.to(urlTemplate);
	// inputsPassThrough.per_page.to(urlTemplate);
	// inputsPassThrough.page.to(urlTemplate);

	// inputs.search.to(urlTemplate);
	// inputs.per_page.to(urlTemplate);
	// inputs.page.to(urlTemplate);

	// inputs.to(urlTemplate);
	// const urlOutput = base.output({ $id: "urlOutput" });

	// urlTemplate.url.to(output);
	// inputs.search.to(urlTemplate);
	// inputs.search.to(urlOutput).to(output);
	// urlTemplate.url.to(url).
	// url.url.to(output);

	const fetchUrl = core.fetch({ $id: "fetch", method: "GET" });
	urlTemplate.url.to(fetchUrl);

	// base.output({ $id: "response", response: fetchUrl.response }).to(output);
	const response = spread({ $id: "spreadResponse", object: fetchUrl.response });
	const responseOutput = base.output({ $id: "responseOutput" });
	response.meta.to(responseOutput); //.to(output);

	const resultsOutput = base.output({ $id: "resultsOutput" });
	response.results.to(resultsOutput); //.to(output);

	const meta = spread({ $id: "spreadMeta", object: response.meta });
	const metaOutput = base.output({ $id: "metaOutput" });
	meta.to(metaOutput); //.to(output);

	// const pages = pagesArray({
	// 	$id: "pages",
	// });
	// meta.count.to(pages);
	// meta.per_page.to(pages);
	// const pagesOutput = base.output({ $id: "pagesOutput" });
	// pages.to(pagesOutput); //.to(output);

	// shift and emit each result
	const shiftResult = shift({ $id: "shiftResult" });
	response.results.as("list").to(shiftResult);
	shiftResult.list.to(shiftResult);

	const result = spread({ $id: "spreadResult", object: shiftResult.item });
	const singleResultOutput = base.output({ $id: "singleResultOutput" });
	// result.id.to(singleResultOutput);
	result.to(singleResultOutput);
	// meta.page.to(singleResultOutput);
	// urlTemplate.url.to(singleResultOutput);
	// result.to(singleResultOutput);
	// singleResultOutput.id.to(output);
	// singleResultOutput.to(output);
	// meta.to(output);
	// inputs.to(output);
	// meta.page.to(singleResultOutput);
	// result.id.to(singleResultOutput); //.to(output);
	// result.display_name.to(singleResultOutput); //.to(output);
	// result.title.to(singleResultOutput); //.to(output);
	// result.relevance_score.to(singleResultOutput); //.to(output);

	// const shiftPage = shift({ $id: "shiftPage" });
	// pages.pages.as("list").to(shiftPage);
	// const page = shiftPage.item.as("page");
	// shiftPage.list.to(shiftPage);
	// const nextPageOutput = base.output({ $id: "page" });
	// page.to(nextPageOutput);
	// page.to(urlTemplate);

	const nextPage = nextPageNo({ $id: "nextPage" });
	meta.count.to(nextPage);
	meta.per_page.to(nextPage);
	meta.page.to(nextPage);
	//
	const nextPageOutput = base.output({ $id: "nextPageOutput" });
	nextPage.page.to(nextPageOutput);
	// nextPage.count.to(nextPageOutput);
	// nextPage.per_page.to(nextPageOutput);

	nextPage.page.to(urlTemplate);
	nextPage.per_page.to(urlTemplate);
	// nextPage.page.to(urlTemplate);

	// inputs.per_page.to(urlTemplate);
	// inputs.search.to(urlTemplate);
	// nextPage.per_page.to(urlTemplate);
	// nextPage.count.to(urlTemplate);

	// shiftPage.item.as("page").to(base.output({ $id: "page" }));
	// shiftPage.list.to(shiftPage);

	return output;
	// return {
	// url: urlOutput,
	// response: responseOutput,
	// results: resultsOutput,
	// meta: metaOutput,
	// pages: pagesOutput,
	// singleResult: singleResultOutput,
	// page: nextPageOutput,
	// };
});

const serialized = await b.serialize();
// console.log(JSON.stringify(serialized, null, 2));
fs.writeFileSync("serialized.json", JSON.stringify(serialized, null, 2));

await merMake({
	graph: b,
	destination: import.meta.dirname,
	ignoreSubgraphs: true,
});
fs.writeFileSync(
	path.join(import.meta.dirname, "board.json"),
	JSON.stringify(serialized, null, 2)
);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(serialized);

class ProbeClass implements Probe {
	report?(message: ProbeMessage): Promise<void> {
		console.log("-".repeat(20), "probe message start" + "-".repeat(20));
		console.log(JSON.stringify(message, null, 2));
		// console.log(message);
		console.log("-".repeat(20), "probe message end" + "-".repeat(20));
		return Promise.resolve();
	}
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
		// throw new Error("Method not implemented.");
	}
	dispatchEvent(event: Event): boolean {
		// throw new Error("Method not implemented.");
		return true;
	}
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions | undefined
	): void {
		// throw new Error("Method not implemented.");
	}
}

const kits = [asRuntimeKit(Core), asRuntimeKit(TemplateKit)];
// const inputs = { search: "Artificial Intelligence" };
const inputs = { search: "Artificial Intelligence", per_page: 10 };
// const inputs = { page: 1, per_page: 2, search: `"Artificial Intelligence"` };
// const runner = await BoardRunner.fromGraphDescriptor(myBoard);

async function runHarness() {
	for await (const runResult of run({
		url: ".",
		kits,
		remote: undefined,
		proxy: undefined,
		diagnostics: false,
		runner: runner,
	} satisfies RunConfig)) {
		console.log("=".repeat(80));
		console.debug({ type: runResult.type });
		if (runResult.type == "input") {
			console.log("input");
			console.log(runResult);
			console.log(inputs);
			// runResult.inputs = { list: ["a", "b", "c"] };
			runResult.reply({
				inputs,
			});
			console.log();
		} else if (runResult.type == "output") {
			console.log("output");
			console.log(runResult);
			console.log();
			//
		} else {
			console.debug("else");
			console.debug(runResult);
			console.debug();
		}
	}
}
// await runHarness();

console.log("\n", "+".repeat(80), "\n");
async function runWithRunner() {
	for await (const runResult of runner.run({
		// probe: new ProbeClass(),
		kits,
	})) {
		console.log();
		console.log("=".repeat(80));
		console.log("=".repeat(80));
		console.log("=".repeat(80));
		console.log();
		console.log({ type: runResult.type });

		if (runResult.type == "input") {
			console.log({ inputs });
			// runResult.inputs = { list: ["a", "b", "c"] };
			runResult.inputs = inputs;
			console.log();
		} else if (runResult.type == "output") {
			console.log({
				id: runResult.node.id,
				output: runResult.outputs,
			});
			console.log();
		} else if (runResult.type == "graphend") {
		} else {
			console.log({ type: runResult.type });
			console.log();
		}
	}
}
await runWithRunner();
