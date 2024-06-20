import { board, base, code, BoardRunner, asRuntimeKit } from "@google-labs/breadboard";
import Core, { core } from "@google-labs/core-kit";
import path from "path";
import fs from "fs";

const dataSchema = {
    type: "string",
    title: "data",
    default: "The answer to the universe is",
    description: "The data to send to the hugging face api"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

export type HuggingFaceTextGenerationParams = {
    inputs: string

};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` , "content-type": "application/json"}

    return { auth };
});

const handleParams = code<{ inputs: string }>((input) => {
    const {
        inputs,
    } = input

    const payload: HuggingFaceTextGenerationParams = {
        inputs: inputs,
    }
    
    return { payload }
})

const serialized = await board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Text Generation",
            properties: {
                inputs: dataSchema,
                apiKey: keySchema,
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/openai-community/gpt2"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey.isString() })
    const { payload } = handleParams({
        inputs: inputs.inputs.isString(),
    });

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    });

    response.to(output);

    return { output }
}).serialize({
    title: "Hugging Face Text Generation Board",
    description: "Board which calls the Hugging Face Text Generation Endpoint"
});

fs.writeFileSync(
    path.join(".", "board.json"),
    JSON.stringify(serialized, null, "\t")
);