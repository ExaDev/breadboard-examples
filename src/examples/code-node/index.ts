#! /usr/bin/env npx -y tsx

import {
	OutputValues,
	board,
	code
} from "@google-labs/breadboard";
import { merMake } from "../../util/merMake.js";

// Define code node outside board
const toUppercase = code<{ input: string; }, OutputValues>(({ input }) => {
	const uppercase = input.toUpperCase();
	return { uppercase };
});

const myBoard = board<{ greet: string; subject: string; }, OutputValues>(
	({ greet, subject }) => {
		const uppercase = toUppercase({ input: greet });

		// Define code node inside board
		const concat = code(({ base, toConcat }) => {
			const concatenated = (base as string).concat(toConcat as string);
			return { concatenated };
		})();

		greet.as("base").to(concat);
		subject.as("toConcat").to(concat);

		// Anonymous code node
		const reversed = concat.concatenated.as("text").to(
			code(({ text }) => {
				const reversed = (text as string).split("").reverse().join("");
				return { reversed };
			})()
		);

		return {
			uppercase: uppercase,
			concatenated: concat.concatenated,
			reversed: reversed.reversed,
		};
	}
);

console.log(
	JSON.stringify(await myBoard({ greet: "Hello", subject: "World" }), null, 2)
);

await merMake({
	graph: myBoard,
	destination: import.meta.dirname,
});
