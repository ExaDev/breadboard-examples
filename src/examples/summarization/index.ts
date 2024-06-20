import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import path from "path";
import fs from "fs";

const inputsSchema = {
    type: "string",
    title: "inputs",
    default: "data",
    description: "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

export type HuggingFaceSummarizationParams = {
    inputs: string
    parameters: {
        options: {
            use_cache: boolean
            wait_for_model: boolean
        }
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ inputs: string }>((input) => {
    const { inputs } = input
    const request: HuggingFaceSummarizationParams = {
        inputs: inputs,
        parameters: {
            options: {
                use_cache: true,
                wait_for_model: true
            }
        }
    };

    const payload = JSON.stringify(request);

    return { payload }
});

const serialized = await board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Summarization",
            properties: {
                inputs: inputsSchema,
                apiKey: keySchema,
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string });
    const { payload } = handleParams({
        inputs: inputs.inputs.isString(),
    });

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    });

    response.to(output)

    return { output }
}).serialize({
    title: "Hugging Face Summarization Board",
    description: "Board which calls the Hugging Face Summarization Endpoint"
});

fs.writeFileSync(
    path.join(".", "board.json"),
    JSON.stringify(serialized, null, "\t")
);