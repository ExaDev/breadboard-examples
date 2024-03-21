import { BoardRunner, OutputValues, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";

import Core from "@google-labs/core-kit";


import { FeatureKit } from "./featurekit.js";
import { StringKit } from "./kits/StringKit.js"
import { ClaudeKit } from "./kits/ClaudeKit.js"
import { ConfigKit } from "./kits/ConfigKit.js"
import { ObjectKit } from "./kits/ObjectKit.js"

const featureKit = addKit(FeatureKit)
const claudeKit = addKit(ClaudeKit);
const stringKit = addKit(StringKit)
const config = addKit(ConfigKit)
const objectK = addKit(ObjectKit)
const coreKit = addKit(Core)
const objectKit = addKit(ObjectKit)

const serverUrl = "https://api.anthropic.com/v1/complete";

const claudeParams = {
    model: "claude-2",
    url: `${serverUrl}`,
};

const prompt = [
    "Create a markdown document that can be used to teach a junior developer about the feature discussed in the `feature` code block.",
    "Base the script on the content of the `featureResources` code block.",
    "The first line of the document should be a heading with the name of the feature.",
    "\n",
    "Provide your response formatted as raw markdown.",
    "Only respond with the result of this request.",
    "Do not add any additional information to the script",
    "\n",
    "```featureResources",
    "{{featureResources}}",
    "```",
    "\n",
    "```selectedFeature",
    "{{selectedFeature}}",
    "```",
].join("/n");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const autoBakeBoard = board(() => {
    const features = featureKit.chromeStatusApiFeatures({ $id: "ChromeStatusApiFeatures" })
    const selected = featureKit.selectRandomFeature({$id:"selectRandomFeature", input: features.output })
    const featureContent = featureKit.getResourcesForFeature({ $id: "getResourcesForFeature", feature: selected.output })

    const filtered = featureKit.filterFeatureAttributes({ feature: selected.output })

    const instructionTemplate = stringKit.template({
        $id: "claudePromptConstructor",
        template: prompt,
    });
    
    featureContent.output.as("featureResources").to(instructionTemplate)
    filtered.output.as("selectedFeature").to(instructionTemplate)

    const serverUrl = "https://api.anthropic.com/v1/complete";

	const claudeParams = {
		model: "claude-2",
		url: `${serverUrl}`,
	};

	const claudeCompletion = claudeKit.complete({
		$id: "claudeAPI",
		...claudeParams,
	});

	const claudeApiKey = config.readEnvVar({
		key: "CLAUDE_API_KEY",
        path:"."
	});

    // claudeApiKey.output.to(claudeCompletion);
    // instructionTemplate.output.as("text").to(claudeCompletion);


    const output = claudeApiKey.output

    return { output }
})

const serializedBoard = await autoBakeBoard.serialize({
    title: "Xenova Code Node-Kit Board",
    description: "Board which performs sentiment analysis using xenova LLM",
    url: ".",
})

const kits = [asRuntimeKit(ConfigKit) ,asRuntimeKit(FeatureKit), asRuntimeKit(FeatureKit), asRuntimeKit(FeatureKit), asRuntimeKit(ObjectKit), asRuntimeKit(Core), asRuntimeKit(StringKit)]

// running board from json and providing kit at runtime
const runner = await BoardRunner.fromGraphDescriptor(serializedBoard);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
    } else if (stop.type === "output") {
        console.log("output with Kit", JSON.stringify(stop.outputs, null, 2));
    }
}