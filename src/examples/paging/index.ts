#!/usr/bin/env tsx

import {
	BoardRunner,
	asRuntimeKit,
	base,
	board,
	code,
} from "@google-labs/breadboard";
import Core, { core } from "@google-labs/core-kit";
import TemplateKit, { templates } from "@google-labs/template-kit";
import fs from "fs";
import path from "path";
import { merMake } from "../../util/merMake.ts";

const pop = code((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		// return {};
		const list = inputs.list;
		const item = list.pop();
		return { item, list };
	}
	return {};
});
const concat = code<{ list: unknown[]; concat: unknown[] }>((inputs) => {
	if (Array.isArray(inputs.list) && Array.isArray(inputs.concat)) {
		return {
			list: inputs.list.concat(inputs.concat),
		};
	} else {
		throw new Error("inputs are not arrays");
	}
});

const pickAndSpread = code<{ key: string; object: any }>(
	({ key = "key", object }) => {
		// const key = inputs.key;
		if (typeof object !== "object") {
			throw new Error(`object is of type ${typeof object} not object`);
		}
		if (!(key in object)) {
			throw new Error(
				`key ${key} not in object, keys are ${Object.keys(object)}`
			);
		}
		const value = object[key];
		return { ...value };
	}
);

const spread = code<{ object: any }>(({ object }) => {
	if (typeof object !== "object") {
		throw new Error(`object is of type ${typeof object} not object`);
	}
	return { ...object };
});

const pages = code<{ count: number; per_page: number }>((inputs) => {
	const { count, per_page } = inputs;
	const pages = Math.ceil(count / per_page);
	return { pages };
});

// const stringJoin = code((inputs) => {
// 	// if separator is not provided, it defaults to ""
// 	const { separator = "", ...rest } = inputs;
// 	return {
// 		result: Object.values(rest)
// 			.map((v: any) => v.toString())
// 			.join(separator as string),
// 	};
// });
const stringJoin = code<
	{ left: string; right: string; separator: string },
	{ result: string }
>((inputs) => {
	const { left, right, separator = "" } = inputs;
	return {
		result: [left, right].join(separator),
	};
});

const calculateNextPage = code<{
	page: number;
	per_page: number;
	count: number;
}>((inputs) => {
	const { page, per_page, count } = inputs;
	if (page * per_page < count) {
		return { page: page + 1 };
	}
	return {};
});

const calculateTotalPages = code<{ count: number; per_page: number }>(
	(inputs) => {
		const { count, per_page } = inputs;
		return { totalPages: Math.ceil(count / per_page) };
	}
);

const b = board((inputs) => {
	const openAlexSearchUrl = templates.urlTemplate({
		$id: "makeURL",
		template:
			"https://api.openalex.org/works?search={search}&page={page}&per_page={per_page}&select={select}",
		per_page: 100,
		page: 1,
		select: "id",
		search: inputs.search,
	});

	const fetch = core.fetch({
		// $id: "fetch",
		method: "GET",
	});

	const output = base.output();

	// inputs.search.to(openAlexSearchUrl);
	openAlexSearchUrl.url.to(output);

	openAlexSearchUrl.to(fetch);
	fetch.response.to(output);

	const response = fetch.response.as("object").to(spread());
	response.to(output);

	const meta = response.meta.as("object").to(spread());
	meta.to(output);

	const getNextPage = meta.to(calculateNextPage());
	getNextPage.to(output);

	const accumulate = concat({ $id: "accumulate", list: [] });
	// openAlexSearchUrl.to(accumulate);

	return output;
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
	kits: [asRuntimeKit(Core), asRuntimeKit(TemplateKit)],
})) {
	console.log("=".repeat(80));
	console.log({ type: runResult.type });

	if (runResult.type == "input") {
		const inputs = { search: "Artificial Intelligence" };
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
