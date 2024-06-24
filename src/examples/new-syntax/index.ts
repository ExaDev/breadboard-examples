import {
	board,
	defineNodeType,
	input,
	output,
	serialize,
} from "@breadboard-ai/build";
import {
	BoardRunner,
	GraphDescriptor,
	Kit,
	OutputValues,
	asRuntimeKit,
} from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import { KitBuilder } from "@google-labs/breadboard/kits";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import Core, { code } from "@google-labs/core-kit";
import { makeFiles } from "../../util/merMake.js";

const text = input({
	type: "string",
	title: "Text",
	description: "The text to output",
	examples: ["What is the square root of pi?"],
	default: "What is the square root of pi?",
});

const message = code(
	{
		$id: "text",
		$metadata: {
			title: "text",
			description: "my message to return",
		},
		text,
	},
	{
		message: "string",
	},
	({ text }) => {
		return { message: text };
	}
);

const myPassthrough = defineNodeType({
	name: "myPassthrough",
	inputs: {
		pIn: { type: "string" },
	},
	outputs: {
		pOut: { type: "string" },
	},
	invoke: (inputs) => inputs,
});

const inputMessage = input({ type: "string" });
// const passthroughInstance = passthrough({ pOut: inputMessage });
const passthroughInstance = myPassthrough({ pIn: inputMessage });
const outputMessage = output(passthroughInstance.outputs.pOut);
const boardInstance = board({
	// inputs: {
	// 	inputIn: inputMessage,
	// },
	inputs: inputMessage,
	// outputs: {
	// outputOut: passthroughInstance.outputs,
	// },
	outputs: passthroughInstance.outputs,
});

const serialisedBoard: GraphDescriptor = serialize(boardInstance);
await makeFiles({ graph: serialisedBoard });
const stringifiedBoard = JSON.stringify(serialisedBoard);
const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(
	serialisedBoard
);

const runTimeKits: Kit[] = [
	asRuntimeKit(Core),
	asRuntimeKit(
		new KitBuilder({
			url: ".",
		}).build({ myPassthrough: myPassthrough })
	),
];

const runConfig: RunConfig = {
	url: ".",
	kits: runTimeKits,
	remote: undefined,
	proxy: undefined,
	diagnostics: true,
	runner: runner,
};

// for await
for await (const runResult of runner.run(runConfig)) {
	console.log("RUNNER.RUN");
	console.log("=".repeat(80));
	if (runResult.type === "input") {
		runResult.inputs = {
			inputIn: "What is the square root of pi?",
		};
	} else if (runResult.type === "output") {
		console.log("output with Kit", JSON.stringify(runResult.outputs, null, 2));
	} else {
		console.log(runResult);
	}
}

console.log("+".repeat(80));

for await (const runResult of run(runConfig)) {
	console.log("HARNESS.RUN");
	console.log("=".repeat(80));
	if (runResult.type === "input") {
		await runResult.reply({
			inputs: {
				inputIn: "What is the square root of pi?",
			},
		} satisfies InputResolveRequest);
	} else if (runResult.type === "output") {
		const resultOutputs: OutputValues = runResult.data.outputs;
		console.log("output with Kit", JSON.stringify(resultOutputs, null, 2));
	} else {
		// console.log(runResult);
	}
}
