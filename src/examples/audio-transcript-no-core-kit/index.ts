import { base, board, code } from "@google-labs/breadboard";
import fs from "fs";

const filePathSchema = {
	type: "string",
	title: "inputs",
	default: "my_file.mp4",
	description: "The audio file to transcribe",
};

const keySchema = {
	type: "string",
	title: "apiKey",
	default: "myKey",
	description: "The hugging face api key",
};

const transcribeFile = code<{ file_name: string, apiKey: string}>(async (input) => {
	const {file_name, apiKey} = input

	const data = fs.readFileSync(file_name);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
		{
			headers: { Authorization: `Bearer ${apiKey}` },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return {result};
});


export const huggingFaceAudioTranscript = board(() => {
	const inputs = base.input({
		$id: "query",
		schema: {
			title: "Hugging Face Schema For Audio Transcript",
			properties: {
				file_name: filePathSchema,
				apiKey: keySchema,
			},
		},
		type: "string",
	});

	const task =
		"https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h";
	const output = base.output({ $id: "main" });

	const { result } = transcribeFile({file_name: inputs.file_name.isString(), apiKey :inputs.apiKey.isString()}) 

	result.to(output);
	return { output };
});
