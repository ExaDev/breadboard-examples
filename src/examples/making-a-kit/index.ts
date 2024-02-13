#! /usr/bin/env npx -y tsx

import { addKit, board, InputValues } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import { merMake } from "../../util/merMake.js";

const stringManipulationKit = new KitBuilder({
	url: ".",
}).build({
	joiner: async (inputs) => ({
		result: (Object.values(inputs)).join(" "),
	}),
	splitter: async (inputs) => ({
		result: Object.entries(inputs).map(([key, value]) => ({
			[key]: value?.toString().split("")
		}))
	})
});

const kitInstance = addKit(stringManipulationKit);

const myBoard = board<InputValues, { output: string; }>(
	(inputs, { output }) => {
		const joinerNode = kitInstance.joiner(inputs);
		const joined = joinerNode.result.as("joined");

		const splitterNode = kitInstance.splitter(inputs);
		const split = splitterNode.result.as("split");

		const out = output();

		joined.to(out);
		split.to(out);

		return out;
	}
);

console.log(JSON.stringify(await myBoard({ a: "hello", b: "world" }), null, 2));

await merMake({
	graph: myBoard,
	destination: import.meta.dirname
});
