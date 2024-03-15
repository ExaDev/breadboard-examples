import { BoardRunner, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";
import { merMake } from "../../util/merMake.js";
import { KitBuilder } from "@google-labs/breadboard/kits";

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

const myKit = new KitBuilder({
    url: "."
}).build({
    pipe: async (message) => (
        {
            output: await xenovaPipe(message)
        }
    )
})
const kitInstance = addKit(myKit);
//  using code node via kit
const kitBoard = board(({ message }) => {
    const { output } = kitInstance.pipe(message)
    console.log("OUTPUT", output)
    return { output };
});

const serializedBoard = await kitBoard.serialize({
    title: "Xenova Code Node-Kit Board",
    description: "Board which performs sentiment analysis using xenova LLM",
    url: ".",
})

// running board from json and providing kit at runtime
const runner = await BoardRunner.fromGraphDescriptor(serializedBoard);
for await (const stop of runner.run({ kits: [asRuntimeKit(myKit)] })) {
    if (stop.type === "input") {
        stop.inputs = {
            message: myMessage,
        };
    } else if (stop.type === "output") {
        console.log("output with Kit", JSON.stringify(stop.outputs, null, 2));
    }
}

merMake({
    graph: serializedBoard,
    destination: import.meta.dirname,
});

