// import { board, base, code} from "@google-labs/breadboard";
import  { core } from "@google-labs/core-kit";

// export const TransformerTask = {
//     fillMask: "fill-mask",
//     summarization: "summarization",
//     questionAnswering: "question-answering",
//     tableQuestionAnswering: "table-question-answering",
//     sentenceSimilarity: "sentence-similarity",
//     textClassification: "text-classification",
//     textGeneration: "text-generation",
//     textToTextGeneration:"text-to-text-generation",
//     tokenClassification: "token-classification",
//     namedEntityRecognition: "named-entity-recognition"
// } as const;

// export const TransformerTaskURL = {
// 	textClassification: "text-classification",
// 	tokenClassification: "token-classification",
	
// 	fillMask: "fill-mask",
// 	summarization: "summarization",
// 	translation: "translation",
// 	text2textGeneration: "text2text-generation",
// 	textGeneration: "text-generation",
// 	zeroShotClassification: "zero-shot-classification",
// 	audioClassification: "audio-classification",
// 	automaticSpeechRecognition: "automatic-speech-recognition",
// 	textToAudio: "text-to-audio",
// 	imageToText: "image-to-text",
// 	imageClassification: "image-classification",
// 	imageSegmentation: "image-segmentation",
// 	zeroShotImageClassification: "zero-shot-image-classification",
// 	objectDetection: "object-detection",
// 	zeroShotObjectDetection: "zero-shot-object-detection",
// 	documentQuestionAnswering: "document-question-answering",
// 	imageToImage: "image-to-image",
// 	depthEstimation: "depth-estimation",
// 	featureExtraction: "feature-extraction",
// } as const;

// export type TransformerTask =
// 	(typeof TransformerTask)[keyof typeof TransformerTask];

const data={inputs: "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."}

const response = await core.fetch({
    headers: { Authorization: `Bearer mykey`},
    method: "POST",
    body: JSON.stringify(data),
    url: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
})

console.log("RESPONSE", response)