import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { HuggingFaceTask } from "./types.js";

const inputsSchema = {
    type: "string",
    title: "inputs",
    default: "The first president of the USA was called[MASK].",
    description: "The data to send to the hugging face api fill-mask endpoint"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

const useCacheSchema = {
    type: "boolean",
    title: "use_cache",
    default: "true",
    description: "Boolean. There is a cache layer on the inference API to speedup requests we have already seen. Most models can use those results as is as models are deterministic (meaning the results will be the same anyway). However if you use a non deterministic model, you can set this parameter to prevent the caching mechanism from being used resulting in a real new query"
};

const waitForModelSchema = {
    type: "boolean",
    title: "wait_for_model",
    default: "false",
    description: " Boolean. If the model is not ready, wait for it instead of receiving 503. It limits the number of requests required to get your inference done. It is advised to only set this flag to true after receiving a 503 error as it will limit hanging in your application to known places"
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
    const auth = { Authorization: `Bearer ${key}` };

    return { auth };
});

const handleParams = code<{ input: HuggingFaceFillMaskRawParams }>((input) => {
    const { inputs, use_cache, wait_for_model } = input

    const request: HuggingFaceFillMaskParams = {
        inputs: inputs,
        options: {
            use_cache: use_cache,
            wait_for_model: wait_for_model
        }
    };

    const payload = JSON.stringify(request);

    return { payload }
});

const huggingFaceBoardFillMask = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Fill Mask",
            properties: {
                inputs: inputsSchema,
                apiKey: keySchema,
                use_cache: useCacheSchema,
                wait_for_model: waitForModelSchema
            },
        },
        type: "string",
    });

    const task = HuggingFaceTask.fillMask
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string });
    const { payload } = handleParams(inputs);

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    });

    response.to(output);

    return { output }
});

const data = "The first president of the USA was called[MASK]."

console.log(
    JSON.stringify(await huggingFaceBoardFillMask({ inputs: data, apiKey: "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", use_cache: true, wait_for_model: true }), null, 2)
);