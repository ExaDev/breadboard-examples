import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import path from "path";
import fs from "fs"

const inputsSchema = {
    type: "string",
    title: "inputs",
    default: "In this work, we explore how to learn task specific language models aimed towards learning rich representation of keyphrases from text documents. We experiment with different masking strategies for pre-training transformer language models (LMs) in discriminative as well as generative settings. In the discriminative setting, we introduce a new pre-training objective - Keyphrase Boundary Infilling with Replacement (KBIR), showing large gains in performance (up to 9.26 points in F1) over SOTA, when LM pre-trained using KBIR is fine-tuned for the task of keyphrase extraction. In the generative setting, we introduce a new pre-training setup for BART - KeyBART, that reproduces the keyphrases related to the input text in the CatSeq format, instead of the denoised original input. This also led to gains in performance (up to 4.33 points inF1@M) over SOTA for keyphrase generation. Additionally, we also fine-tune the pre-trained language models on named entity recognition(NER), question answering (QA), relation extraction (RE), abstractive summarization and achieve comparable performance with that of the SOTA, showing that learning rich representation of keyphrases is indeed beneficial for many other fundamental NLP task",
    description: "The data to send to the hugging face api token classification endpoint"
};

const keySchema = {
    type: "string",
    title: "apiKey",
    default: "myKey",
    description: "The hugging face api key"
};

const aggregationStrategySchema = {
    type: "string",
    title: "aggregation_strategy",
    default: "simple",
    description: `There are several aggregation strategies:
    none: Every token gets classified without further aggregation.
    simple: Entities are grouped according to the default schema (B-, I- tags get merged when the tag is similar).
    first: Same as the simple strategy except words cannot end up with different tags. Words will use the tag of the first token when there is ambiguity.
    average: Same as the simple strategy except words cannot end up with different tags. Scores are averaged across tokens and then the maximum label is applied.
    max: Same as the simple strategy except words cannot end up with different tags. Word entity will be the token with the maximum score.`
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

export type HuggingFaceTokenClassificationRawParams = {
    inputs: string
    aggregation_strategy: "simple" | "first" | "average"

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceTokenClassificationParams = {
    inputs: string
    parameters: {
        aggregation_strategy: "simple" | "first" | "average"
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

const handleParams = code<{ inputs: string, aggregation_strategy: "simple" | "first" | "average", use_cache: boolean, wait_for_model:boolean }>((input) => {
    const {
        inputs,
        aggregation_strategy,
        use_cache,
        wait_for_model
    } = input

    const request: HuggingFaceTokenClassificationParams = {
        inputs: inputs,
        parameters: {
            aggregation_strategy: aggregation_strategy,
            options: {
                use_cache: use_cache,
                wait_for_model: wait_for_model
            }
        }
    };

    const payload = JSON.stringify(request);

    return { payload }
});

const serialized = await board(() => {
    const inputs = base.input({
        $id: "token-classification-params",
        schema: {
            title: "Hugging Face Schema for token classification",

            properties: {
                inputs: inputsSchema,
                apiKey: keySchema,
                aggregation_strategy: aggregationStrategySchema,
                use_cache: useCacheSchema,
                wait_for_model: waitForModelSchema
            },
        },
        type: "string",
    });

    const task = "https://api-inference.huggingface.co/models/ml6team/keyphrase-extraction-kbir-inspec"
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
}).serialize({
    title: "Hugging Face Token Classification Board",
    description: "Board which calls the Hugging Face Token Classification Endpoint"
});

fs.writeFileSync(
    path.join(".", "board.json"),
    JSON.stringify(serialized, null, "\t")
);