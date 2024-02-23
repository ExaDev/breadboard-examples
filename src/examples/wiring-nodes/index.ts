import { addKit, board, InputValues, OutputValues } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import { merMake } from "../../util/merMake.js";

const stringKit = new KitBuilder({
	url: "."
}).build({
	repeater: async (inputs: InputValues & { text?: string, num?: number; }): Promise<OutputValues> => {
		const { text, num } = inputs;
		const my_str = (text as string).repeat(num as number);

		return Promise.resolve({ repeaterOutput: my_str });
	},
	splitter: async (inputs: InputValues): Promise<OutputValues> => {
		const { repeaterOutput } = inputs;
		const my_str = (repeaterOutput as string).split("");

		return Promise.resolve({ result: my_str });
	}
});

const kitInstance = addKit(stringKit);

const myBoard = board<InputValues, { output: string; }>(
	(inputs, { output }) => {
		const repeaterNode = kitInstance.repeater(inputs);
	// wire output from repeater node to splitter node
		const splitterNode = repeaterNode.to(kitInstance.splitter());

		const res = splitterNode.result.as("splitResult");

		return res.to(output());
	}
);

console.log(JSON.stringify(await myBoard({ text: "hello", num: 2 }), null, 2));

await merMake({
	graph: myBoard,
	destination: import.meta.dirname,
});
