import { board, base, asRuntimeKit, BoardRunner, code } from "@google-labs/breadboard";

import Core, { core } from "@google-labs/core-kit";

const limitInputSchema = {
    type: "number",
    title: "Story Limit",
    default: "1",
    description: "The Number of HackerNews Story ID's to return"
}

const slice = code<{ list: number[], limit: number }>(({ list, limit }) => {
    return { output: list.slice(0, limit) }
})

const boardSchema = "https://raw.githubusercontent.com/breadboard-ai/breadboard/main/packages/schema/breadboard.schema.json";

export const firebaseBoardTopStoryIds = await board(() => {
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

    const { response } = core.fetch({ $id: "fetch", method: "GET", url: "https://hacker-news.firebaseio.com/v0/topstories.json" });
    const output = base.output({ $id: "main" });
    const sliced = slice({ list: response as unknown as number[], limit: input.limit })

    sliced.to(output)

    return { output }
}).serialize({
    title: "Hacker News Firebase API Story IDs",
    description: "Board which returns the top story IDs from Hacker News",
    version: "0.0.1",
    url: "https://github.com/ExaDev/breadboard-examples/tree/hackerNews-toolworker/src/examples/hackerNews/firebase"
})

firebaseBoardTopStoryIds.$schema = boardSchema

const kits = [asRuntimeKit(Core)]
const runner = await BoardRunner.fromGraphDescriptor(firebaseBoardTopStoryIds);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            limit: 10,
        }
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}
