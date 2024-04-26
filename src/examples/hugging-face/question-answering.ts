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

const handleParams = code<{ input: HuggingQuestionAnsweringRawParams}>((input) => {
    const { question, context,} = input

    const payload: HuggingQuestionAnsweringParams = {"inputs": {
        question: question,
        context: context,
    }}

    return { payload }
})

const huggingFaceBoardQuestionAnswering = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Question Answering",
            properties: {
                // TODO fix the schema
                inputs: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const task = HuggingFaceTask.questionAnswering
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

const question = "What is my name?"
const context = "My name is Clara and I live in Berkeley."

console.log(
    JSON.stringify(await huggingFaceBoardQuestionAnswering({ question: question, context: context,  apiKey: "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", use_cache:true, wait_for_model: true}), null, 2)
);

