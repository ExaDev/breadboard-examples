import { board, addKit, base, asRuntimeKit, BoardRunner } from "@google-labs/breadboard";
import HackerNewsFirebaseKit from "./HackerNewsFirebaseKit.js";
const firebaseKit = addKit(HackerNewsFirebaseKit)


const storyInputSchema = {
    type: "string",
    title: "Story ID",
    default: "39788322",
    description: "HackerNews Story ID to extract",
};

const limitInputSchema = {
    type : "number",
    title: "Story Limit",
    default: "1",
    description: "The Number of HackerNews Story ID's to return"
}

export const firebaseBoardStoryIds = await board(() => {
    const input = base.input({
        $id: "limit",
        schema: {
            title: "Hacker News Story",
            properties: {
                limit: limitInputSchema
            },
        },
        type: "number",
    })

    const output = base.output({ $id: "main" });
    const topStoryIds = firebaseKit.topStoryIds({limit: input.limit})
    topStoryIds.to(output)

    return { output }
}).serialize({
    title: "Hacker News Firebase API Story IDs",
    description:"Board which returns the top story IDs from Hacker News",
    version: "0.0.1"
})

export const firebaseBoardStoryFromId = await board(() => {
    const input = base.input({
        $id: "storyID",
        schema: {
            title: "Hacker News Story",
            properties: {
                storyID: storyInputSchema
            },
            required: ["storyID"],
        }
    })

    const output = base.output({ $id: "main" });
    const topStoryIds = firebaseKit.getStoryFromId({ id: input.storyID })
    topStoryIds.to(output)

    return { output }
}).serialize(
    {
        title: "Hacker News Firebase API Story Extractor",
        description: "Board which extracts contents of a given Hacker News story ID",
        version: "0.0.1"
    }
)

const kits = [asRuntimeKit(HackerNewsFirebaseKit)]
const runner = await BoardRunner.fromGraphDescriptor(firebaseBoardStoryFromId);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            storyID: "39788322",
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}

const runner2 = await BoardRunner.fromGraphDescriptor(firebaseBoardStoryIds);
for await (const stop of runner2.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            limit: 2,
        }
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}
