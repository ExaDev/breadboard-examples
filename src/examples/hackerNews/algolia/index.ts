import { board, addKit, base, asRuntimeKit, BoardRunner } from "@google-labs/breadboard";
import { HackerNewsAlgoliaKit } from "../kits/HackerNewsAlgoliaKit.js"
import { ListKit } from "../kits/ListKit.js"
import HackerNewsFirebaseKit from "../kits/HackerNewsFirebaseKit.js";


const algoliaKit = addKit(HackerNewsAlgoliaKit)
const listKit = addKit(ListKit)
const firebaseKit = addKit(HackerNewsFirebaseKit)

const limitInputSchema = {
    type: "number",
    title: "Story Limit",
    default: "1",
    description: "The Number of HackerNews Story ID's to return"
}



const algoliaBoardGetStoryFromId = await board(({ }) => {
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
    const { storyIds } = firebaseKit.topStoryIds({ limit: input.limit })
    const { item } = listKit.pop({ list: storyIds })

    const story = algoliaKit.getStoryFromId({ id: item })

    story.to(output)

    return { output }
}).serialize({
    title: "Hacker News Firebase API Story IDs",
    description: "Board which returns the top story IDs from Hacker News",
    version: "0.0.1",
    url: "https://github.com/ExaDev/breadboard-examples/tree/hackerNews-toolworker/src/examples/hackerNews/algolia"
})

const algoliaBoardSearch = await board((inputs) => {
    const {output} = algoliaKit.search(inputs)

    return {output}

}).serialize()

const kits = [asRuntimeKit(HackerNewsFirebaseKit), asRuntimeKit(ListKit), asRuntimeKit(HackerNewsAlgoliaKit)]
const runner = await BoardRunner.fromGraphDescriptor(algoliaBoardGetStoryFromId);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            limit: 2,
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}

const runner2 = await BoardRunner.fromGraphDescriptor(algoliaBoardSearch);
for await (const stop of runner2.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            query: "JavaScript",
            tags: ["story"],
            numericFilters: [
                {
                    field: "points",
                    operator: ">",
                    value: 100,
                },
            ],
            page: 2,
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}