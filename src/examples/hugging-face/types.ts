import { code } from "@google-labs/breadboard";


// Some types that will be used when dynamic schemas are available

export const HuggingFaceTask = {
    fillMask: "https://api-inference.huggingface.co/models/bert-base-uncased",
    summarization: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    questionAnswering: "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
    sentenceSimilarity: "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    textClassification: "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
    textGeneration: "https://api-inference.huggingface.co/models/gpt2",
    tokenClassification: "https://api-inference.huggingface.co/models/ml6team/keyphrase-extraction-kbir-inspec",
    namedEntityRecognition: "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ru-en",
    translation: "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-ru-en",
    labelling: "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
    conversational: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
    audioTranscript: "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
    imageClassification: "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
} as const;


export type HuggingFaceTask =
    (typeof HuggingFaceTask)[keyof typeof HuggingFaceTask];


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


const selectTask = code<{ task: string }>((inputs) => {
    const task = HuggingFaceTask[inputs.task as keyof typeof HuggingFaceTask]

    return { task };
});
