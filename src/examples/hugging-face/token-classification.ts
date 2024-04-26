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


export type HuggingFaceTokenClassificationRawParams = {
    inputs: string
    aggregation_strategy: "simple" | "first" | "average"

    use_cache: boolean
    wait_for_model: boolean
};

export type HuggingFaceTokenClassificationParams = {
    inputs: string
    parameters: {
        aggregation_strategy : "simple" | "first" | "average"
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

const handleParams = code<{ input: HuggingFaceTokenClassificationRawParams}>((input) => {
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
    }

    const payload = JSON.stringify(request)

    return { payload }
})

const huggingFaceBoardTextGeneration = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Hugging Face Schema For Text 2 Text Generation",
            // TODO fix the schema
            properties: {
                inputs: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const task = HuggingFaceTask.tokenClassification
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

const data = "In this work, we explore how to learn task specific language models aimed towards learning rich representation of keyphrases from text documents. We experiment with different masking strategies for pre-training transformer language models (LMs) in discriminative as well as generative settings. In the discriminative setting, we introduce a new pre-training objective - Keyphrase Boundary Infilling with Replacement (KBIR), showing large gains in performance (up to 9.26 points in F1) over SOTA, when LM pre-trained using KBIR is fine-tuned for the task of keyphrase extraction. In the generative setting, we introduce a new pre-training setup for BART - KeyBART, that reproduces the keyphrases related to the input text in the CatSeq format, instead of the denoised original input. This also led to gains in performance (up to 4.33 points inF1@M) over SOTA for keyphrase generation. Additionally, we also fine-tune the pre-trained language models on named entity recognition(NER), question answering (QA), relation extraction (RE), abstractive summarization and achieve comparable performance with that of the SOTA, showing that learning rich representation of keyphrases is indeed beneficial for many other fundamental NLP task"

console.log(
    JSON.stringify(await huggingFaceBoardTextGeneration({ inputs: data, aggregation_strategy:"simple", apiKey: "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", use_cache:true, wait_for_model: true}), null, 2)
);