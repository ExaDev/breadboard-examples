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


export type HuggingFaceLabellingRawParams = {
    inputs: string;
    candidate_labels: string[];
    multi_label: boolean;
    use_cache: boolean;
    wait_for_model: boolean;
};

export type HuggingFaceLabellingParams = {
    inputs: string;
    parameters: {
        candidate_labels: string[];
        multi_label: boolean;
   
        options: {
            use_cache: boolean;
            wait_for_model: boolean;
        }
    }
};


const authenticate = code<{ key: string }>((inputs) => {
    const key = inputs.key
    const auth = { Authorization: `Bearer ${key}` }

    return { auth };
});

const handleParams = code<{ input: HuggingFaceLabellingRawParams}>((input) => {
    const {
        inputs,
        candidate_labels,
        multi_label,
        use_cache,
        wait_for_model
    } = input

    const payload: HuggingFaceLabellingParams = {
        inputs: inputs,
        parameters: {
            candidate_labels: candidate_labels,
            multi_label: multi_label,
            options: {
                use_cache: use_cache,
                wait_for_model: wait_for_model
            }
        }
    }

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

    const task = HuggingFaceTask.labelling
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

const data = "Hi, I recently bought a device from your company but it is not working as advertised and I would like to get reimbursed!"
const candidate_labels = ["refund", "legal", "faq"]

console.log(
    JSON.stringify(await huggingFaceBoardTextGeneration({ inputs: data, candidate_labels: candidate_labels, multi_label: false,  apiKey: "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", use_cache:true, wait_for_model: true}), null, 2)
);