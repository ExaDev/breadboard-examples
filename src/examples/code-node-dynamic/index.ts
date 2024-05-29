import { board, code } from "@google-labs/breadboard";
import { makeFiles } from "../../util/merMake.js";

const myMessage = `Dogs are an amazing part of life and can bring joy to your whole family, but when your little fur ball gets hurt or sick it can be a scary time. In this article I will be looking at the 9 healthiest dog breeds and how they made the list.
Though these breeds are proven to be resilient there can still be complications as all dogs are different. If you are getting a dog from a breeder make sure it is a reputable one and if you are adopting contact your veterinarian to get your dog checked out. No dogs will be 100% healthy their entire life but this list of dogs can hold their own.`

const xenovaPipe = code(async ({ message }) => {
    // dynamic import
    const output = await import("@xenova/transformers").then(async xenova => {
        const pipe = await xenova.pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment')

        return await pipe(message as string)
    })

    return { output }
});


const myBoard = board(({ message }) => {
    const { output } = xenovaPipe(message)
    return { output };
});

console.log("output code node only", JSON.stringify(await myBoard({ message: myMessage }), null, 2));

const serializedBoard = await myBoard.serialize({
    title: "Xenova Code Node Board",
    description: "Board which performs sentiment analysis using xenova LLM",
    url: ".",
})

makeFiles({
    graph: serializedBoard,
    destination: import.meta.dirname,
});
