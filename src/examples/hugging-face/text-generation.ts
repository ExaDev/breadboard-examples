import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { HuggingFaceTask } from "./types.js";

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


export type HuggingFaceTextGenerationRawParams = {
    inputs: string
    top_k: number;
    top_p: number;
    temperature: number;
    repetition_penalty: number;
    max_new_tokens: number;
    max_time: number;
    return_full_text: boolean;
    num_return_sequences: number;
    do_sample: boolean

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceTextGenerationParams = {
    inputs: string
    parameters: {
        top_k: number;
        top_p: number;
        temperature: number;
        repetition_penalty: number;
        max_new_tokens: number;
        max_time: number;
        return_full_text: boolean;
        num_return_sequences: number;
        do_sample: boolean

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

const handleParams = code<{ input: HuggingFaceTextGenerationRawParams}>((input) => {
    const {
        inputs,
        top_k,
        top_p,
        temperature,
        repetition_penalty,
        max_new_tokens,
        max_time,
        return_full_text,
        num_return_sequences,
        do_sample,
        use_cache,
        wait_for_model
    } = input

    const request: HuggingFaceTextGenerationParams = {
        inputs: inputs,
        parameters: {
            top_k:top_k,
            top_p: top_p,
            temperature: temperature,
            repetition_penalty: repetition_penalty,
            max_new_tokens: max_new_tokens,
            max_time: max_time,
            return_full_text: return_full_text,
            num_return_sequences: num_return_sequences,
            do_sample: do_sample,
            options: {
                use_cache: use_cache,
                wait_for_model: wait_for_model
            }
        }
    }

    const payload = JSON.stringify(request)

    return { payload }
})

const huggingFaceBoardTextGeneration = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Text Generation",
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

    const { payload } = handleParams(inputs)

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    })

    response.to(output)

    return { output }
})

const data = "The answer to the universe is"

console.log(
    JSON.stringify(await huggingFaceBoardTextGeneration({ inputs: data, apiKey: "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", use_cache:true, wait_for_model: true}), null, 2)
);