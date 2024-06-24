import { board, input, output } from "@breadboard-ai/build";
import { BoardRunner, GraphDescriptor, OutputValues } from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import { code } from "@google-labs/core-kit";

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

const myBoard = board({
	title: "MY HELLO WORLD BOARD",
	inputs: { text },
	outputs: {
		message: output(message.outputs.message, {
			title: "Hello World Output",
			description: "The generated tool calls",
		}),
	},
});

const runner = await BoardRunner.fromGraphDescriptor(
	myBoard as unknown as GraphDescriptor
);

const runConfig: RunConfig = {
	url: ".",
	kits: [],
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
		console.log(
			"output with Kit",
			JSON.stringify(resultOutputs, null, 2)
		);
	}
}
