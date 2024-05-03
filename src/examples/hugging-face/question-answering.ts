import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import { HuggingFaceTask } from "./types.js";

const questionSchema = {
    type: "string",
    title: "question",
    default: "What is my name?",
    description: "The data to send to the hugging face api question answering endpoint"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

const contextSchema = {
    type: "string",
    title: "context",
    default: "My name is Clara and I live in Berkeley.",
    description: "context for the question being asked"
};

const useCacheSchema = {
    type: "boolean",
    title: "use_cache",
    default: "true",
    description: "Boolean. There is a cache layer on the inference API to speedup requests we have already seen. Most models can use those results as is as models are deterministic (meaning the results will be the same anyway). However if you use a non deterministic model, you can set this parameter to prevent the caching mechanism from being used resulting in a real new query"
}

const waitForModelSchema = {
    type: "boolean",
    title: "wait_for_model",
    default: "false",
    description: " Boolean. If the model is not ready, wait for it instead of receiving 503. It limits the number of requests required to get your inference done. It is advised to only set this flag to true after receiving a 503 error as it will limit hanging in your application to known places"
};


export type HuggingQuestionAnsweringRawParams = {
    question: string
    context: string

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingQuestionAnsweringParams = {
    inputs: {
        question: string
        context: string
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ input: HuggingQuestionAnsweringRawParams }>((input) => {
    const { question, context, } = input

    const payload: HuggingQuestionAnsweringParams = {
        "inputs": {
            question: question,
            context: context,
        }
    }

    return { payload }
});

const huggingFaceBoardQuestionAnswering = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Question Answering",
            properties: {
                question: questionSchema,
                apiKey: keySchema,
                context: contextSchema,
                use_cache: useCacheSchema,
                wait_for_model: waitForModelSchema
            },
        },
        type: "string",
    });

    const task = HuggingFaceTask.questionAnswering
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

const question = "What is my name?"
const context = "My name is Clara and I live in Berkeley."

console.log(
    JSON.stringify(await huggingFaceBoardQuestionAnswering({ question: question, context: context, apiKey: "myAPiKey", use_cache: true, wait_for_model: true }), null, 2)
);

