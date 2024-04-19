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

export type HuggingFaceFillMaskRawParams = {
    inputs: string
    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceFillMaskParams = {
    inputs: string

    options: {
        use_cache: boolean
        wait_for_model: boolean
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleFillMaskParams = code<{ input: HuggingFaceFillMaskRawParams}>((input) => {
    const { inputs, use_cache, wait_for_model} = input

    const request: HuggingFaceFillMaskParams = {
        inputs: inputs,
        options: {
            use_cache: use_cache,
            wait_for_model: wait_for_model
        }
    }

    const payload = JSON.stringify(request)

    return { payload }
})

const huggingFaceBoardSummarization = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Fill Mask",
            properties: {
                // TODO fix the schema
                inputs: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const task = HuggingFaceTask.fillMask
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string })

    const { payload } = handleFillMaskParams(inputs)

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    })

    response.to(output)

    return { output }
})

const data = "The first president of the USA was called[MASK]."

console.log(
    JSON.stringify(await huggingFaceBoardSummarization({ inputs: data, apiKey: "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", use_cache:true, wait_for_model: true}), null, 2)
);