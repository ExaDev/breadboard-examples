#!/usr/bin/env tsx

import {
	BoardRunner,
	InputValues,
	Probe,
	ProbeMessage,
	Schema,
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

const shift = code<{ list: InputValues[] }>((inputs) => {
	if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {
		const list = inputs.list;
		const item = list.shift();
		return { item, list };
	}
	return {};
});

const spread = code<{ object: object }>((inputs) => {
	const object = inputs.object;
	if (typeof object !== "object") {
		throw new Error(`object is of type ${typeof object} not object`);
	}
	return { ...object };
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

const progress = code<{ current: number; total: number }>((inputs) => {
	const { current, total } = inputs;
	return { progress: current / total, current, total };
});
const inputSchema: Schema = {
	required: ["search"],
	properties: {
		search: { type: "string" },
		page: { type: "integer", default: "1" },
		per_page: { type: "integer", default: "200" },
		entity: {
			type: "string",
			default: "works",
			enum: [
				"works",
				"authors",
				"sources",
				"institutions",
				"topics",
				"publishers",
				"funders",
				"concepts",
			],
		},
	},
};

const debug = false;
const b = board((inputs) => {
	const output = base.output({ $id: "main" });
	const debugOutput = base.output({ $id: "debug" });

	const urlTemplate = templates.urlTemplate({
		$id: "urlTemplate",
		template:
			"https://api.openalex.org/{entity}?search={search}&page={page}&per_page={per_page}&select={select}",
		page: 1,
		entity: "works",
		select: "id,display_name,title,relevance_score",
	});
	// inputs.to(urlTemplate);

	const input = base.input({
		schema: inputSchema,
	});
	input.to(urlTemplate);

	base.output({ $id: "urlOutput", url: urlTemplate.url });

	const fetchUrl = core.fetch({ $id: "fetch", method: "GET" });
	urlTemplate.url.to(fetchUrl);

	const response = spread({ $id: "spreadResponse", object: fetchUrl.response });

	if (debug) response.to(debugOutput);
	if (debug) response.to(debugOutput);

	const meta = spread({ $id: "spreadMeta", object: response.meta });

	if (debug) meta.to(debugOutput);

	const shiftResult = shift({ $id: "shiftResult" });
	response.results.as("list").to(shiftResult);
	shiftResult.list.to(shiftResult);

	const result = spread({ $id: "spreadResult", object: shiftResult.item });

	result.to(output);

	const nextPage = nextPageNo({ $id: "nextPage" });

	meta.to(nextPage);
	if (debug) nextPage.to(debugOutput);

	nextPage.to(urlTemplate);

	return output;
});

const boardSchema =
	"https://raw.githubusercontent.com/breadboard-ai/breadboard/main/packages/schema/breadboard.schema.json";
const serialized = await b.serialize({
	// $schema: boardSchema,
	title: "OpenAlex Search",
	description: ["Search OpenAlex for works"].join("\n"),
	url: "https://github.com/ExaDev-io/breadboard-examples/tree/looping-example/src/examples/paging",
});
serialized.$schema = boardSchema;
fs.writeFileSync("serialized.json", JSON.stringify(serialized, null, "\t"));

await merMake({
	graph: b,
	destination: import.meta.dirname,
	ignoreSubgraphs: true,
});
fs.writeFileSync(
	path.join(import.meta.dirname, "board.json"),
	JSON.stringify(serialized, null, "\t")
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
		console.log("=".repeat(80));
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
