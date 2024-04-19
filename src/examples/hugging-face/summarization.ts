import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { HuggingFaceTask } from "./types";

const dataSchema = {
    type: "string",
    title: "data",
    default: "data",
    description: "The data to send to the hugging face api"
};

const taskSchema = {
    type: "string",
    title: "task",
    default: "summarization",
    description: "The task for the board"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};


export type HuggingFaceSummarizationRawParams = {
    inputs: string
    min_length: number;
    max_length: number;
    top_k: number;
    top_p: number;
    temperature: number;
    repetition_penalty: number;
    max_time: number;
};

export type HuggingFaceSummarizationParams = {
    inputs: string
    parameters: {
        min_length: number;
        max_length: number;
        top_k: number;
        top_p: number;
        temperature: number;
        repetition_penalty: number;
        max_time: number;

        options: {
            use_cache: boolean
            wait_for_model: boolean
        }
    }
};

export type HuggingFaceTextClassificationParams = {
    inputs: string;
    options: {
        use_cache: boolean;
        wait_for_model: boolean;
    }
}

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleSummaryParams = code<{ input: HuggingFaceSummarizationRawParams}>((input) => {
    const { inputs, min_length, max_length, top_k, top_p, temperature, repetition_penalty, max_time } = input

    const request: HuggingFaceSummarizationParams = {
        inputs: inputs,
        parameters: {
            min_length: min_length, max_length: max_length, top_k: top_k, top_p: top_p, temperature: temperature, repetition_penalty: repetition_penalty, max_time: max_time,
            options: {
                use_cache: false,
                wait_for_model: false
            }
        }
    }

    const payload = JSON.stringify(request)

    return { payload }
})

const huggingFaceBoardSummarization = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Summarization",
            // TODO fix the schema
            properties: {
                inputs: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const task = HuggingFaceTask.summarization
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string })

    const { payload } = handleSummaryParams(inputs)

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    })

    response.to(output)

    return { output }
})

const data = "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."

console.log(
    JSON.stringify(await huggingFaceBoardSummarization({ inputs: data, temperature: 1, apiKey: "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", }), null, 2)
);