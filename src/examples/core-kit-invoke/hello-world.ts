#! /usr/bin/env npx -y tsx

import { board } from "@google-labs/breadboard";

const graph = await board<{ message: string; }>(({ message }, { output }) => {
	const renamedOutput = message.as("output").to(output());
	return renamedOutput;
}).serialize()

export default graph