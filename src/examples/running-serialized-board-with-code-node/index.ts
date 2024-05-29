import {
    BoardRunner,
    OutputValues,
    asRuntimeKit,
    board,
    code,
} from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import { makeFiles } from "../../util/merMake.js";

const toUppercase = code<{ input: string }, OutputValues>(({ input }) => {
	const uppercase = input.toUpperCase();
	return { uppercase };
});

const myBoard = board<{ greet: string; subject: string }, OutputValues>(
	({ greet, subject }) => {
		const uppercase = toUppercase({ input: greet });

		const concat = code(({ base, toConcat }) => {
			const concatenated = (base as string).concat(toConcat as string);
			return { concatenated };
		})();

		greet.as("base").to(concat);
		subject.as("toConcat").to(concat);

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

const runner = await BoardRunner.fromGraphDescriptor(
	await myBoard.serialize({ title: "My Board" })
);

console.log(
	JSON.stringify(
		await runner.runOnce(
			{ greet: "Hello", subject: "World" },
			{ kits: [asRuntimeKit(Core)] }
		),
		null,
		2
	)
);
await makeFiles({
	graph: myBoard,
	destination: import.meta.dirname,
});
