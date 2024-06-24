import { board, input, output, serialize } from "@breadboard-ai/build";
import {
	BoardRunner,
	GraphDescriptor,
	asRuntimeKit,
} from "@google-labs/breadboard";

import Core, { code } from "@google-labs/core-kit";

const text = input({
	type: "string",
	title: "Text",
	description: "The text to output",
	examples: ["Hello World"],
	default: "Hello World",
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
	title: "Hello World Board without harness",
	inputs: { text },
	outputs: {
		message: output(message.outputs.message, {
			title: "Hello World Output",
			description: "Board Output",
		}),
	},
});

const serialisedBoard: GraphDescriptor = serialize(boardInstance);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(
	serialisedBoard
);

console.log(JSON.stringify(await runner.runOnce(			
    {text: "Hello World"}, { kits: [asRuntimeKit(Core)] }), null, 2))