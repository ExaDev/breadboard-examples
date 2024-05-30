import { BoardRunner, OutputValues, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";

import Core from "@google-labs/core-kit";
import fs from "fs"

import { FeatureKit } from "./featurekit.js";
import { StringKit } from "./kits/StringKit.js"
import { ClaudeKit } from "./kits/ClaudeKit.js"
import { ConfigKit } from "./kits/ConfigKit.js"
import { ObjectKit } from "./kits/ObjectKit.js"

const featureKit = addKit(FeatureKit)
const claudeKit = addKit(ClaudeKit);
const stringKit = addKit(StringKit)
const config = addKit(ConfigKit)

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

const autoBakeBoard = board(() => {
    const features = featureKit.chromeStatusApiFeatures({ $id: "ChromeStatusApiFeatures" })
    const selected = featureKit.selectRandomFeature({$id:"selectRandomFeature", features: features.output })
    const featureContent = featureKit.getResourcesForFeature({ $id: "getResourcesForFeature", feature: selected.output })

    const filtered = featureKit.filterFeatureAttributes({ feature: selected.output })

    const instructionTemplate = stringKit.template({
        $id: "claudePromptConstructor",
        template: prompt,
    });
    
    featureContent.output.as("featureResources").to(instructionTemplate)
    filtered.output.as("selectedFeature").to(instructionTemplate)

	const claudeCompletion = claudeKit.complete({
		$id: "claudeAPI",
		...claudeParams,
	});

	const claudeApiKey = config.readEnvVar({
		key: "CLAUDE_API_KEY",
        path:"."
	});

    claudeApiKey.output.to(claudeCompletion);
    instructionTemplate.output.as("text").to(claudeCompletion);

    const output = claudeCompletion.completion

    return { output }
})

const serializedBoard = await autoBakeBoard.serialize({
    title: "AutoBake",
    description: "AutoBake Board Example",
    url: ".",
})

const kits = [asRuntimeKit(ConfigKit) , asRuntimeKit(FeatureKit), asRuntimeKit(FeatureKit), asRuntimeKit(FeatureKit), asRuntimeKit(ObjectKit), asRuntimeKit(Core), asRuntimeKit(StringKit), asRuntimeKit(ClaudeKit)]

// running board from json and providing kit at runtime
const runner = await BoardRunner.fromGraphDescriptor(serializedBoard);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
    } else if (stop.type === "output") {
        const content = [,
            stop.outputs.output as string,
            "---",
        ].join("\n\n")

        fs.writeFileSync("./test.md", content);
    }
}