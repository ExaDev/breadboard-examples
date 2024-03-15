import { BoardRunner, OutputValues, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";

import Core from "@google-labs/core-kit";


import { FeatureKit } from "./featurekit.js";
import { StringKit } from "./kits/StringKit.js"
import { ClaudeKit } from "./kits/ClaudeKit.js"
import { ConfigKit } from "./kits/ConfigKit.js"
import { ObjectKit } from "./kits/ObjectKit.js"

const featureKt = addKit(FeatureKit)
const claudeKit = addKit(ClaudeKit);
const stringKit = addKit(StringKit)
const config = addKit(ConfigKit)
const objectK = addKit(ObjectKit)
const coreKit = addKit(Core)
const objectKit = addKit(ObjectKit)



function filterAttributes(obj: any) {
    // recursively remove any falsy attributes

    if (!obj) {
        return
    } else if (typeof obj === "object") {
        const newObj: any = {}
        for (const [key, value] of Object.entries(obj)) {
            const newValue = filterAttributes(value)
            if (newValue) {
                newObj[key] = newValue
            }
        }
        if (Object.keys(newObj).length > 0) {
            return newObj
        } else {
            return
        }
    }
    // 	if array
    else if (Array.isArray(obj)) {
        const newArray: any[] = []
        for (const value of obj) {
            const newValue = filterAttributes(value)
            if (newValue) {
                newArray.push(newValue)
            }
        }
        return newArray
    }
    return obj
}

const recursivelyFilterEmptyAttributes = coreKit.runJavascript({
    name: "filterAttributes",
    code: filterAttributes.toString(),
    raw: true
})



const serverUrl = "https://api.anthropic.com/v1/complete";

const claudeParams = {
    model: "claude-2",
    url: `${serverUrl}`,
};

const prompt = [
    "Create a markdown document that can be used to teach a junior developer about the feature discussed in the `feature` code block.",
    "Base the script on the content of the `resources` code block.",
    "The first line of the document should be a heading with the name of the feature.",
    "\n",
    "Provide your response formatted as raw markdown.",
    "Only respond with the result of this request.",
    "Do not add any additional information to the script",
    "\n",
    "```resources",
    "{{resources}}",
    "```",
    "\n",
    "```feature",
    "{{feature}}",
    "```",
].join("/n");

type identifiable = { id: number }
type identifiableArray = identifiable[]

const selectRandom = code<{ list: identifiableArray }, OutputValues>(({ list }) => {
    {
        const selected = list[Math.floor(Math.random() * list.length)]
        return { id: selected.id, selected, list }
    }
})

const autoBakeBoard = board(() => {
    const features = featureKt.chromeStatusApiFeatures({ $id: "ChromeStatusApiFeatures" })

    const selected = featureKt.selectRandomFeature({ input: features.output})

    const featureContent = featureKt.getResourcesForFeature({$id: "getResourcesForFeature", feature: selected.output})


    const claudeApiKey = config.readEnvVar({
        $id: "getClaudeAPIKey",
        key: "CLAUDE_API_KEY"
    });

    const claudeCompletion = claudeKit.complete({
        $id: "claudeAPI",
        ...claudeParams,
    });

    const instructionTemplate = stringKit.template({
        $id: "claudePromptConstructor",
        template: prompt,
    });

    const output = selected.output

    return { output }
})

const serializedBoard = await autoBakeBoard.serialize({
    title: "Xenova Code Node-Kit Board",
    description: "Board which performs sentiment analysis using xenova LLM",
    url: ".",
})

const kits = [asRuntimeKit(FeatureKit), asRuntimeKit(StringKit), asRuntimeKit(FeatureKit), asRuntimeKit(FeatureKit), asRuntimeKit(ObjectKit), asRuntimeKit(Core)]

// running board from json and providing kit at runtime
const runner = await BoardRunner.fromGraphDescriptor(serializedBoard);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
    } else if (stop.type === "output") {
        console.log("output with Kit", JSON.stringify(stop.outputs, null, 2));
    }
}