import { board, addKit, base} from "@google-labs/breadboard";
import { HackerNewsAlgoliaKit } from "./HackerNewsAlgoliaKit.js"
import { ListKit } from "./ListKit.js"
import HackerNewsFirebaseKit from "./HackerNewsFirebaseKit.js";


const algoliaKit = addKit(HackerNewsAlgoliaKit)
const listKit = addKit(ListKit)
const firebaseKit = addKit(HackerNewsFirebaseKit)

const limitInputSchema = {
    type : "number",
    title: "Story Limit",
    default: "1",
    description: "The Number of HackerNews Story ID's to return"
}

const algoliaBoard = board(({ }) => {
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
})