#!/usr/bin/env tsx

import {
	BoardRunner,
	asRuntimeKit,
	board,
	code,
} from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import fs from "fs";
import path from "path";
import { merMake } from "../../util/merMake.js";
const b = board((inputs) => {
	const pop = code((inputs) => {
		if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
			// return {};
			const list = inputs.list;
			const item = list.pop();
			return { item, list };
		}
		return {};
	});

	const invokePop = pop({ $id: "pop" });
	inputs.list.to(invokePop);
	invokePop.list.to(invokePop);

	return {
		item: invokePop.item,
		remaining: invokePop.list.as("remaining"),
	};
});

const serialized = await b.serialize();
console.log(JSON.stringify(serialized, null, 2));
fs.writeFileSync("serialized.json", JSON.stringify(serialized, null, 2));

await merMake({
	graph: b,
	destination: import.meta.dirname,
});
fs.writeFileSync(
	path.join(import.meta.dirname, "board.json"),
	JSON.stringify(serialized, null, 2)
);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(serialized);

for await (const runResult of runner.run({
	kits: [asRuntimeKit(Core)],
})) {
	console.log("=".repeat(80));
	console.log({ type: runResult.type });

	if (runResult.type == "input") {
		const inputs = { list: ["a", "b", "c"] };
		console.log({ inputs });
		runResult.inputs = inputs;
		console.log();
	} else if (runResult.type == "output") {
		console.log({
			output: runResult.outputs,
		});
		console.log();
	} else {
		console.log({ type: runResult.type });
		console.log();
	}
}
