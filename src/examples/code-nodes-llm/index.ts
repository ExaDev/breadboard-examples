import { BoardRunner, GraphDescriptor, Kit, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";
import * as fs from 'fs';
import { merMake } from "../../util/merMake.js";
import { KitBuilder } from "@google-labs/breadboard/kits";

const myMessage = fs.readFileSync('./src/examples/code-nodes-llm/text.txt', 'utf8');

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
//  using code node directly
const myBoard = board(({ message }) => {
    const { output } = xenovaPipe(message)
    return { output };
});

//  using code node via kit
const kitBoard = board(({ message }) => {
    const { output } = kitInstance.pipe(message)
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


console.log("output code node only", JSON.stringify(await myBoard({ message: myMessage }), null, 2));

// TODO Workout if it's possible to run board from JSON without code nodes being added to kit
