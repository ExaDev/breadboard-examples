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

const topKSchema = {
    type: "number",
    title: "top_k",
    default: "None",
    description: "Integer to define the top tokens considered within the sample operation to create new text"
};

const topPSchema = {
    type: "number",
    title: "top_P",
    default: "None",
    description: "Float to define the tokens that are within the sample operation of text generation. Add tokens in the sample for more probable to least probable until the sum of the probabilities is greater than top_p"
};

const maxLengthSchema = {
    type: "number",
    title: "max_length",
    default: "100",
    description: "Max Length of the input"
};

const numReturnSequencesSchema = {
    type: "number",
    title: "num_return_sequences",
    default: "3",
    description: "Number of responses "
}


export type HuggingFaceTextGenerationRawParams = {
    inputs: string
    top_k: number;
    top_p: number;
    max_length: number;
    num_return_sequences: number;
};

export type HuggingFaceTextGenerationParams = {
    inputs: string
    parameters: {
        top_k: number;
        top_p: number;
        max_length: number;
        num_return_sequences: number;
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ inputs: string, top_k: number, top_p:number, max_length: number, num_return_sequences: number}>((input) => {
    const {
        inputs,
        top_k,
        top_p,
        max_length,
        num_return_sequences
    } = input

    const payload: HuggingFaceTextGenerationParams = {
        inputs: inputs,
        parameters: {
            top_k: top_k,
            top_p: top_p,
            max_length: max_length,
            num_return_sequences: num_return_sequences
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
                top_k: topKSchema,
                top_p: topPSchema,
                max_length: maxLengthSchema
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/openai-community/gpt2"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string })
    const { payload } = handleParams({
        inputs: inputs.inputs as unknown as string,
        top_k: inputs.top_k as unknown as number,
        top_p: inputs.top_p as unknown as number,
        max_length: inputs.max_length as unknown as number,
        num_return_sequences: inputs.num_return_sequences as unknown as number
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