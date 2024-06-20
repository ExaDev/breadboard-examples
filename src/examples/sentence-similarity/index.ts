import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import path from "path";
import fs from "fs";

const soruceSentenceSchema = {
    type: "string",
    title: "inputs",
    default: "That is a happy person",
    description: "The data to send to the hugging face api sentence similarity endpoint"
};

const sentencesSchema = {
    type: "list",
    title: "sentences",
    default: "[That is a happy dog, That is a very happy person,Today is a sunny day]",
    description: "A list of sentences to compare the source sentence to"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

export type HuggingFaceSentenceSimilarityParams = {
    inputs: {
        source_sentence: string
        sentences: string[]
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` , "content-type": "application/json"}

    return { auth };
});

const handleParams = code<{ source_sentence: string, sentences: string[] }>((input) => {
    const { source_sentence, sentences } = input

    const payload: HuggingFaceSentenceSimilarityParams = {
        "inputs": {
            source_sentence: source_sentence,
            sentences: sentences
        },
    };

    return { payload }
});

const serialized = await board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Sentence Similarity",
            properties: {
                source_sentence: soruceSentenceSchema,
                sentences: sentencesSchema,
                apiKey: keySchema,
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey.isString() })
    const { payload } = handleParams({
        source_sentence: inputs.source_sentence.isString(),
        sentences: inputs.sentences as unknown as string[],
    });

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: payload,
        url: task
    });

    response.to(output);
    return { output }
}).serialize({
    title: "Hugging Face Sentence Similarity Board",
    description: "Board which calls the Hugging Face Sentence Similarity Endpoint"
});

fs.writeFileSync(
    path.join(".", "board.json"),
    JSON.stringify(serialized, null, "\t")
);