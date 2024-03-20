#!/usr/bin/env tsx

import {
	BoardRunner,
	InputValues,
	Probe,
	ProbeMessage,
	asRuntimeKit,
	base,
	board,
	code,
} from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import Core, { core } from "@google-labs/core-kit";
import TemplateKit, { templates } from "@google-labs/template-kit";
import fs from "fs";
import path from "path";
import { merMake } from "../../util/merMake.ts";

const pop = code((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		const list = inputs.list;
		const item = list.pop();
		return { item, list };
	}
	return {};
});

const shift = code<{ list: InputValues[] }>((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		const list = inputs.list;
		const item = list.shift();
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

const spread = code<{ object: object }>((inputs) => {
	const object = inputs.object;
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

const stringJoin = code<
	{ left: string; right: string; separator: string },
	{ result: string }
>((inputs) => {
	const { left, right, separator = "" } = inputs;
	return {
		result: [left, right].join(separator),
	};
});

const nextPageNo = code<{
	page?: number;
	per_page: number;
	count: number;
}>(({ page = 1, count, per_page = 200 }) => {
	const finalPage = Math.ceil(count / per_page);
	const nextPage = page + 1;
	if (nextPage > finalPage) {
		return {};
	}
	return { page: nextPage, per_page, count };
});

const calculateTotalPages = code<{ count: number; per_page: number }>(
	(inputs) => {
		const { count, per_page } = inputs;
		return { totalPages: Math.ceil(count / per_page) };
	}
);

const increment = code<{ value: number }>((inputs) => {
	const { value } = inputs;
	return { value: value + 1 };
});

const pagesArray = code<{
	count: number;
	per_page: number;
	page?: number;
}>((inputs) => {
	const { count, per_page, page = 1 } = inputs;
	const pages = Math.ceil(count / per_page);
	const start = page;
	const end = pages;
	return {
		pages: Array.from({ length: end - start + 1 }, (_, i) => i + start),
	};
});

const progress = code<{ current: number; total: number }>((inputs) => {
	const { current, total } = inputs;
	return { progress: current / total, current, total };
});

const b = board((inputs) => {
	const output = base.output({ $id: "main" });

	const urlTemplate = templates.urlTemplate({
		$id: "urlTemplate",
		template:
			"https://api.openalex.org/works?search={search}&page={page}&per_page={per_page}&select={select}",

		page: 1,
		select: "id,display_name,title,relevance_score",
	});
	inputs.to(urlTemplate);
	base.output({ $id: "urlOutput", url: urlTemplate.url });

	const fetchUrl = core.fetch({ $id: "fetch", method: "GET" });
	urlTemplate.url.to(fetchUrl);

	const response = spread({ $id: "spreadResponse", object: fetchUrl.response });

	base.output({ $id: "responseOutput", response });

	base.output({ $id: "resultsOutput", results: response.results });

	const meta = spread({ $id: "spreadMeta", object: response.meta });

	base.output({ $id: "metaOutput", meta });

	const shiftResult = shift({ $id: "shiftResult" });
	response.results.as("list").to(shiftResult);
	shiftResult.list.to(shiftResult);

	const result = spread({ $id: "spreadResult", object: shiftResult.item });

	result.to(output);

	const nextPage = nextPageNo({ $id: "nextPage" });

	meta.to(nextPage);
	base.output({ $id: "nextPageOutput", nextPage });

	nextPage.to(urlTemplate);

	return output;
});

const serialized = await b.serialize();
fs.writeFileSync("serialized.json", JSON.stringify(serialized, null, 2));

await merMake({
	graph: b,
	destination: import.meta.dirname,
	ignoreSubgraphs: true,
});
fs.writeFileSync(
	path.join(import.meta.dirname, "board.json"),
	JSON.stringify(serialized, null, 2)
);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(serialized);

class ProbeClass implements Probe {
	report?(message: ProbeMessage): Promise<void> {
		console.log("-".repeat(20), "probe message start" + "-".repeat(20));
		console.log(JSON.stringify(message, null, 2));

		console.log("-".repeat(20), "probe message end" + "-".repeat(20));
		return Promise.resolve();
	}
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions | undefined
	): void {}
	dispatchEvent(event: Event): boolean {
		return true;
	}
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions | undefined
	): void {}
}

const kits = [asRuntimeKit(Core), asRuntimeKit(TemplateKit)];
const inputs = { search: `"Artificial Intelligence"` };

async function runHarness() {
	for await (const runResult of run({
		url: ".",
		kits,
		remote: undefined,
		proxy: undefined,
		diagnostics: false,
		runner: runner,
	} satisfies RunConfig)) {
		console.log("=".repeat(80));
		console.debug({ type: runResult.type });
		if (runResult.type == "input") {
			console.log("input");
			console.log(runResult);
			console.log(inputs);

			runResult.reply({
				inputs,
			});
			console.log();
		} else if (runResult.type == "output") {
			console.log("output");
			console.log(runResult);
			console.log();
			//
		} else {
			console.debug("else");
			console.debug(runResult);
			console.debug();
		}
	}
}
// await runHarness();

console.log("\n", "+".repeat(80), "\n");
async function runWithRunner() {
	for await (const runResult of runner.run({
		// probe: new ProbeClass(),
		kits,
	})) {
		console.log();
		console.log("=".repeat(80));
		console.log("=".repeat(80));
		console.log("=".repeat(80));
		console.log();
		console.log({ type: runResult.type });

		if (runResult.type == "input") {
			console.log({ inputs });

			runResult.inputs = inputs;
			console.log();
		} else if (runResult.type == "output") {
			console.log({
				id: runResult.node.id,
				output: runResult.outputs,
			});
			console.log();
		} else if (runResult.type == "graphend") {
		} else {
			console.log({ type: runResult.type });
			console.log();
		}
	}
}
await runWithRunner();
