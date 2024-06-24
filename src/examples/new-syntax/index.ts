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
	asRuntimeKit,
} from "@google-labs/breadboard";
import { RunConfig } from "@google-labs/breadboard/harness";
import { KitBuilder } from "@google-labs/breadboard/kits";

import { Core } from "@google-labs/core-kit";
import { makeFiles } from "../../util/merMake.js";


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
await makeFiles({ graph: serialisedBoard });

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
			inputMessage: "What is the square root of pi?",
		};
	} else if (runResult.type === "output") {
		console.log("output with Kit", JSON.stringify(runResult.outputs, null, 2));
	}
}
