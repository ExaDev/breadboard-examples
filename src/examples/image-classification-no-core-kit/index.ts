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

const classifyImage = code<{ file_name: string, apiKey: string}>(async (input) => {
	const {file_name, apiKey} = input

	const data = fs.readFileSync(file_name);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
		{
			headers: { Authorization: `Bearer ${apiKey}` },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return {result};
});

// // THIS CAN'T BE A BOARD UNTIL CORE KIT FETCH GETS FIXED, BECAUSE IT STRINGIFIES THE BODY OF THE REQUEST
const huggingFaceImageClassification = board(() => {
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


	const output = base.output({ $id: "main" });

	const { result } = classifyImage({file_name: inputs.file_name.isString(), apiKey :inputs.apiKey.isString()}) 

	result.to(output);
	return { output };
});


const serialised = await huggingFaceImageClassification.serialize({
	title: "Hugging Face Image Classification",
});
export default serialised;

fs.writeFileSync(
	path.join(import.meta.dirname, "graph.json"),
	JSON.stringify(serialised, null, 2)
);
