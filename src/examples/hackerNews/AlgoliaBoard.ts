import { board, addKit} from "@google-labs/breadboard";
import { HackerNewsAlgoliaKit } from "./HackerNewsAlgoliaKit.js"
import { ListKit } from "./ListKit.js"


const algoliaKit = addKit(HackerNewsAlgoliaKit)
const listKit = addKit(ListKit)

const algoliaBoard = board(({ }) => {

})