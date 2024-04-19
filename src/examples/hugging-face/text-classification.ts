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

export type HuggingFaceTextClassificationRawParams = {
    inputs: string
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleFillMaskParams = code<{ input: HuggingFaceTextClassificationRawParams}>((input) => {
    const {inputs} = input

    const request: HuggingFaceTextClassificationRawParams = {inputs: inputs}

    const payload = JSON.stringify(request)

    return { payload }
})

// TODO fix names
const huggingFaceBoardSentenceSimilarity = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Sentence Similarity",
            properties: {
                // TODO fix the schema
                inputs: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const task = HuggingFaceTask.textClassification
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

const inputs = "I like you. I love you"

console.log(
    JSON.stringify(await huggingFaceBoardSentenceSimilarity({ inputs: inputs,  apiKey: "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"}), null, 2)
);

