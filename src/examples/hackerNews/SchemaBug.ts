import { board, base, BoardRunner, code, asRuntimeKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";

const stringInputSchema = {
    type: "string",
    title: "My String",
    default: "default",
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
            title: "Concat Inputs",
            properties: {
                string1: stringInputSchema,
                string2: stringInputSchema
            },
            required: ["string2"]
        },
    })

    const {output} = concat({ myString1: input.string1, myString2: input.string2 })

    return { output }
}).serialize(
    {
        title: "Schema Bug",
        description: "Board which demonstrates schema defaults not being used on required properties.",
        version: "0.0.1"
    }
)

const kits = [asRuntimeKit(Core)]

// this SHOULD return "This is default" because we are using a default, but it does not return the result as expected
const runner = await BoardRunner.fromGraphDescriptor(myBoard);
for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            string1: "This is ",
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}

const runner2 = await BoardRunner.fromGraphDescriptor(myBoard);
for await (const stop of runner2.run({ kits: kits })) {
    if (stop.type === "input") {
        stop.inputs = {
            string1: "This is ",
            string2: "not the default"
        };
    } else if (stop.type === "output") {
        console.log(stop.outputs)
    }
}
