#!/usr/bin/env -S npx -y tsx --no-cache

import { base, board, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import fs from "fs";
import path from "path";

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

const authenticate = code<{ key: string }>((inputs) => {
	const key = inputs.key;
	const auth = { Authorization: `Bearer ${key}` };

	return { auth };
});

const handleParams = code<{ file_name: string }>((input) => {
	const { file_name } = input;

	const payload = fs.readFileSync(file_name);

	return { payload };
});

// // THIS CAN'T BE A BOARD UNTIL CORE KIT FETCH GETS FIXED, BECAUSE IT STRINGIFIES THE BODY OF THE REQUEST
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

	const { auth } = authenticate({ key: inputs.apiKey as unknown as string });
	const { payload } = handleParams({
		file_name: inputs.file_name as unknown as string,
	});

	const response = core.fetch({
		headers: auth,
		method: "POST",
		body: payload,
		url: task,
	});

	response.to(output);
	return { output };
});

// Demonstrates what the board would output
export async function query(filename: string) {
	const data = fs.readFileSync(filename);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
		{
			headers: { Authorization: `Bearer my_key` },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return result;
}

export const demo = async () => {
	await query("audio-sample.mp3").then((response) => {
		console.log("AUDIO TRANSCRIPT", JSON.stringify(response));
	});
};

export const serialised = await huggingFaceAudioTranscript.serialize({
	title: "Hugging Face Audio Transcript",
	description: "Transcribe an audio file using Hugging Face's Wav2Vec2 model",
});

fs.writeFileSync(
	path.join(import.meta.dirname, "graph.json"),
	JSON.stringify(serialised, null, 2)
);

export default serialised;
