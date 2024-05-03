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

export type HuggingFaceSentenceSimilarityRawParams = {
    source_sentence: string
    sentences: string[]

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceSentenceSimilarityParams = {
    inputs: {
        source_sentence: string
        sentences: string[]
    },
    options: {
        use_cache: boolean,
        wait_for_model: boolean
    }
};

const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ source_sentence: string, sentences: string[], use_cache: boolean, wait_for_model: boolean }>((input) => {
    const { source_sentence, sentences, use_cache, wait_for_model } = input

    const payload: HuggingFaceSentenceSimilarityParams = {
        "inputs": {
            source_sentence: source_sentence,
            sentences: sentences,
        },
        "options":
        {
            use_cache: use_cache,
            wait_for_model: wait_for_model
        }
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
                use_cache: useCacheSchema,
                wait_for_model: waitForModelSchema
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    const output = base.output({ $id: "main" });

    const { auth } = authenticate({ key: inputs.apiKey as unknown as string })
    const { payload } = handleParams({
        source_sentence: inputs.source_sentence as unknown as string,
        sentences: inputs.sentences as unknown as string[],
        use_cache: inputs.use_cache as unknown as boolean,
        wait_for_model: inputs.wait_for_model as unknown as boolean
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

