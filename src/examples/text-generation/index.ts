import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
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

const maxLengthSchema = {
    type: "number",
    title: "max_length",
    default: "100",
    description: "Max Length of the input"
};

const numberOfResponses = {
    type: "number",
    title: "num_of_responses",
    default: "3",
    description: "Number of responses to return"
}

export type HuggingFaceTextGenerationParams = {
    inputs: string
    parameters: {
        max_length: number;
        num_of_responses: number;
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ inputs: string, top_k: number, top_p: number, max_length: number, num_of_responses: number}>((input) => {
    const {
        inputs,
        max_length,
        num_of_responses
    } = input

    const payload: HuggingFaceTextGenerationParams = {
        inputs: inputs,
        parameters: {
            max_length: max_length,
            num_of_responses: num_of_responses
        }
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
                max_length: maxLengthSchema,
                num_of_responses: numberOfResponses
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/openai-community/gpt2"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey.isString() })
    const { payload } = handleParams({
        inputs: inputs.inputs.isString(),
        max_length: inputs.max_length.isNumber(),
        num_of_responses: inputs.num_of_responses.isNumber()
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