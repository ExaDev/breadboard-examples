import { board, base, code} from "@google-labs/breadboard";
import  { core } from "@google-labs/core-kit";

export const HuggingFaceTask = {
    fillMaskTask: "https://api-inference.huggingface.co/models/bert-base-uncased",
    summarization: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    questionAnswering: "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
    // tableQuestionAnswering: "https://api-inference.huggingface.co/models/google/tapas-base-finetuned-wtq",
    sentenceSimilarity: "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    textClassification: "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
    textGeneration: "https://api-inference.huggingface.co/models/gpt2",
    tokenClassification: "https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english",
    namedEntityRecognition: "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ru-en",
    translation: "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ru-en",
    zeroShotClassification: "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
    conversational: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
} as const;


export type HuggingFaceTask =
	(typeof HuggingFaceTask)[keyof typeof HuggingFaceTask];

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

export type HuggingFaceFillMaskParams = {
    inputs: string
    options: {
        use_cache: boolean;
        wait_for_model: boolean;
    }
};


export type HuggingFaceQuestionAnsweringParams = {
    inputs: {
        question: string;
        context: string;
    }
};

export type HuggingFaceSentenceSimilarityParams = {
    inputs: {
        source_sentence: string;
        sentences: string[];
    }
};

export type HuggingFaceSummarizationParams = {
    inputs: string
    parameters: {
        min_length: number;
        max_length: number;
        top_k: number;
        top_p: number;
        temperature: number;
        repetition_penalty: number;
        max_time: number;
        options: {
            use_cache: boolean;
            wait_for_model: boolean;
        }
    }
};

export type HuggingFaceTextClassificationParams = {
    inputs: string;
    options : {
        use_cache: boolean;
        wait_for_model: boolean;
    }
}

const selectTask = code<{ task: string }>((inputs) => {
    const task = HuggingFaceTask[inputs.task as keyof typeof HuggingFaceTask]
    return { task };
});

const authenticate =  code<{ key: string }>((inputs) => {
    const key = inputs.key 
    const auth = { Authorization: `Bearer ${key}`}

    return { auth };
});

const huggingFaceBoard = board(() => {
    const inputs =  base.input({
        $id: "query",
        schema: {
            title: "Algolia Limit",
            properties: {
                data: dataSchema,
                task: taskSchema,
                apiKey: keySchema
            },
        },
        type: "string",
    })

    const {task} = selectTask({task:inputs.task as unknown as string})
    const output = base.output({ $id: "main" });
  
    const body = JSON.stringify({inputs: inputs.data as unknown as string})
    const {auth} = authenticate({key: inputs.apiKey as unknown as string})

    const response = core.fetch({
        headers: auth,
        method: "POST",
        body: body,
        url: task
    })
    
    response.to(output)

    return {output}

})

const data= "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."

console.log(
	JSON.stringify(await huggingFaceBoard({ data: data, task: "summarization", apiKey: "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"}), null, 2)
);