#!/usr/bin/env -S npx -y tsx --no-cache

import { base, board, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";
import fs from "fs";
import path from "path";

const filePathSchema = {
	type: "string",
	title: "file_path",
	default: "cat.jpg",
	description: "The image file to classify",
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
const huggingFaceAudioTranscript = board(() => {
	const inputs = base.input({
		$id: "query",
		schema: {
			title: "Hugging Face Schema For Image Classification",
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
async function query(filename: string) {
	const data = fs.readFileSync(filename);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
		{
			headers: { Authorization: `Bearer mykey` },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return result;
}

query("cat.jpg").then((response) => {
	console.log("CLASSIFCATION RESULTS", JSON.stringify(response));
});

const serialised = await huggingFaceAudioTranscript.serialize({
	title: "Hugging Face Image Classification",
});
export default serialised;
fs.writeFileSync(
	path.join(import.meta.dirname, "graph.json"),
	JSON.stringify(serialised, null, 2)
);
