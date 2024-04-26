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

export type HuggingFaceSentenceSimilarityRawParams = {
    source_sentence: string
    sentences: string[]

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceSentenceSimilarityParams = {
    inputs: {
        source_sentence: string
        sentences: string []
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ input: HuggingFaceSentenceSimilarityRawParams}>((input) => {
    const { source_sentence, sentences,} = input

    const payload: HuggingFaceSentenceSimilarityParams = {"inputs": {
        source_sentence: source_sentence,
        sentences: sentences,
    }}

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

    const task = HuggingFaceTask.sentenceSimilarity
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

const source_sentence = "That is a happy person"
const sentences = ["That is a happy dog","That is a very happy person","Today is a sunny day"]

console.log(
    JSON.stringify(await huggingFaceBoardSentenceSimilarity({ source_sentence: source_sentence, sentences: sentences,  apiKey: "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"}), null, 2)
);

