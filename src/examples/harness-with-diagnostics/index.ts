#! /usr/bin/env npx -y tsx

import { base, board, BoardRunner, InputValues } from "@google-labs/breadboard";
import { run, RunConfig } from "@google-labs/breadboard/harness";
import { merMake } from "../../util/merMake.js";
import { InputResolveRequest } from "@google-labs/breadboard/remote";

const myBoard = await board<InputValues>((inputs) => {
	const { partOne, partTwo } = inputs;

	const outputOne = base.output({
		$id: "outputOne",
		schema: {
			type: "object",
			properties: {
				outputMessageOne: { type: "string" },
			},
		},
	});

	const outputTwo = base.output({
		$id: "outputTwo",
		schema: {
			type: "object",
			properties: {
				outputMessageTwo: { type: "string" },
			},
		},
	});

	partOne.as("outputMessageOne").to(outputOne);
	partTwo.as("outputMessageTwo").to(outputTwo);

	return outputTwo;
}).serialize({
	title: "My Board",
	description: "A description of my board",
	url: ".",
});

const runner = await BoardRunner.fromGraphDescriptor(myBoard);

const runConfig: RunConfig = {
	url: ".",
	kits: [],
	remote: undefined,
	proxy: undefined,
	diagnostics: true,
	runner: runner,
};

const iterator = run(runConfig);

let result = await iterator.next();

while (!result.done) {
	console.log("HarnessRunResult event type", result.value.type);
	console.log("HarnessRunResult data", result.value.data);

	if (result.value.type === "input") {
		console.log("node id", result.value.data.node.id);

		await result.value.reply({
			inputs: {
				partOne: "Hello Input Part One",
				partTwo: "Hello Input Part Two"
			},
		} as InputResolveRequest);
	} else if (result.value.type === "output") {
		console.log("node id", result.value.data.node.id);

		if (result.value.data.node.id === "outputOne") {
			console.log(
				"outputOne",
				JSON.stringify(result.value.data.outputs, null, 2)
			);
		} else if (result.value.data.node.id === "outputTwo") {
			console.log(
				"outputTwo",
				JSON.stringify(result.value.data.outputs, null, 2)
			);
		} else if (result.value.data.node.id === "outputThree") {
			console.log(
				"outputThree",
				JSON.stringify(result.value.data.outputs, null, 2)
			);
		}
	}
	result = await iterator.next();
}

await merMake({
	graph: myBoard,
	destination: import.meta.dirname,
});