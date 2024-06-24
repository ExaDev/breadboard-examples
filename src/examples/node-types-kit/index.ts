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

import { Core } from "@google-labs/core-kit";
import { makeFiles } from "../../util/merMake.js";
import { InputResolveRequest } from "@google-labs/breadboard/remote";


const myPassthrough = defineNodeType({
	name: "myPassthrough",
	inputs: {
		message: { type: "string" },
	},
	outputs: {
		pOut: { type: "string" },
	},
	invoke: (inputs) => { return { pOut: inputs.message } },
});

const inputMessage = input({ type: "string" });

const passthroughInstance = myPassthrough({ message: inputMessage });
const boardInstance = board({
	inputs: { inputMessage },

	outputs: { message: output(passthroughInstance.outputs.pOut) },
});

const serialisedBoard: GraphDescriptor = serialize(boardInstance);

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


for await (const runResult of run(runConfig)) {
	if (runResult.type === "input") {
		await runResult.reply({
			inputs: {
				inputMessage: "What is the square root of pi?",
			},
		} satisfies InputResolveRequest);
	} else if (runResult.type === "output") {
		const resultOutputs: OutputValues = runResult.data.outputs;
		console.log("output with Kit", JSON.stringify(resultOutputs, null, 2));
	} 
}

await makeFiles({ graph: serialisedBoard });