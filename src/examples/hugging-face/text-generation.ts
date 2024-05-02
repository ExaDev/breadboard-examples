import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { HuggingFaceTask } from "./types.js";

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

const temperatureSchema = {
    type: "number",
    title: "temperature",
    default: "1.0",
    description: "The temperature of the sampling operation. 1 means regular sampling, 0 means always take the highest score, 100.0 is getting closer to uniform probability"
};

const repetitionPenaltySchema = {
    type: "number",
    title: "repetition_penalty",
    default: "1.0",
    description: "The more a token is used within generation the more it is penalized to not be picked in successive generation passes"
};

const maxNewTokensSchema = {
    type: "number",
    title: "max_tokens",
    default: "None",
    description: "The amount of new tokens to be generated, this does not include the input length it is a estimate of the size of generated text you want. Each new tokens slows down the request, so look for balance between response times and length of text generated"
};

const maxTimeSchema = {
    type: "number",
    title: "max_time",
    default: "None",
    description: "The amount of time in seconds that the query should take maximum. Network can cause some overhead so it will be a soft limit. Use that in combination with max_new_tokens for best results"
};

const returnFullTextSchema = {
    type: "boolean",
    title: "return_full_text",
    default: "true",
    description: "Bool. If set to False, the return results will not contain the original query making it easier for prompting"
};

const numReturnSequencesSchema = {
    type: "number",
    title: "num_return_sequences",
    default: "1",
};

const doSampleSchema = {
    type: "boolean",
    title: "do_sample",
    default: "true",
    description: "Bool. Whether or not to use sampling, use greedy decoding otherwise"
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

const handleParams = code<{ input: HuggingFaceTextGenerationRawParams }>((input) => {
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
            top_k: top_k,
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
            properties: {
                inputs: dataSchema,
                apiKey: keySchema,
                top_k: topKSchema,
                top_p: topPSchema,
                temperature: temperatureSchema,
                repetition_penalty: repetitionPenaltySchema,
                max_new_tokens: maxNewTokensSchema,
                max_time: maxTimeSchema,
                return_full_text: returnFullTextSchema,
                num_return_sequences: numReturnSequencesSchema,
                do_sample: doSampleSchema,
                use_cache: useCacheSchema,
                wait_for_model: waitForModelSchema
            },
        },
        type: "string",
    });

    const task = HuggingFaceTask.summarization
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string })

    const { payload } = handleParams(inputs);

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    });

    response.to(output);

    return { output }
})

const data = "The answer to the universe is"

console.log(
    JSON.stringify(await huggingFaceBoardTextGeneration({ inputs: data, apiKey: "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", use_cache: true, wait_for_model: true }), null, 2)
);