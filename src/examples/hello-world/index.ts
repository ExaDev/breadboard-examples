#! /usr/bin/env npx -y tsx

import { board } from "@google-labs/breadboard";
import { makeFiles } from "../../util/merMake.js";


const myBoard = board<{ message: string; }>(({ message }, { output }) => {
	const renamedOutput = message.as("output").to(output());
	return renamedOutput;
});

console.log(
	JSON.stringify(await myBoard({ message: "Hello Breadboard!" }), null, 2)
);

await makeFiles({
	graph: myBoard,
	destination: import.meta.dirname,
});
