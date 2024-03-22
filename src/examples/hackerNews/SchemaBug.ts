import { board, base, BoardRunner, code, asRuntimeKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";

const stringInputSchema = {
    type: "string",
    title: "My String",
    default: "myString",
    description: "String to concat",
};

const concat = code(({ myString1, myString2 }) => {
    const output = myString1 as string + myString2 as string
    return { output }
})

const myBoard = await board(() => {
    const input = base.input({
        $id: "concat",
        schema: {
            title: "Hacker News Story",
            properties: {
                string1: stringInputSchema,
                string2: stringInputSchema
            },
        },
    })

    const {output} = concat({ myString1: input.string1, myString2: input.string2 })

    return { output }
}).serialize(
    {
        title: "Hacker News Firebase API Story Extractor",
        description: "Board which extracts contents of a given Hacker News story ID",
        version: "0.0.1"
    }
)

const kits = [asRuntimeKit(Core)]

// this SHOULD return "1myString" because we are using a default, but it does not return the result as expected
const runner = await BoardRunner.fromGraphDescriptor(myBoard);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            string1: "This is ",
            // string2: "Ok"
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}
