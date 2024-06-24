import { board, input, output, serialize } from "@breadboard-ai/build";
import {
	BoardRunner,
	GraphDescriptor,
	Kit,
	OutputValues,
	asRuntimeKit,
} from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import Core, { code } from "@google-labs/core-kit";

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

const boardInstance = board({
	title: "MY HELLO WORLD BOARD",
	inputs: { text },
	outputs: {
		message: output(message.outputs.message, {
			title: "Hello World Output",
			description: "The generated tool calls",
		}),
	},
});

const serialisedBoard: GraphDescriptor = serialize(boardInstance);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(
	serialisedBoard
);

const runTimeKits: Kit[] = [asRuntimeKit(Core)];

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
				text: "What is the square root of pi?",
			},
		} satisfies InputResolveRequest);
	} else if (runResult.type === "output") {
		const resultOutputs: OutputValues = runResult.data.outputs;
		console.log("output with Kit", JSON.stringify(resultOutputs, null, 2));
	}
}
