#!/usr/bin/env tsx
// import { generateAndWriteCombinedMarkdown } from "@exadev/breadboard-kits/src/util/files/generateAndWriteCombinedMarkdown.js";
import { BoardRunner, RunResult, asRuntimeKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import board from "../../breadboard/index.js";
import { CliAsyncGeneratorRunner } from "./cliAsyncGeneratorRunner.js";
import HackerNewsFirebaseKit from "../../kits/hackerNews/HackerNewsFirebaseKit.js";
import HackerNewsAlgoliaKit from "../../kits/hackerNews/HackerNewsAlgoliaKit.js";
import ListKit from "../../kits/ListKit.js";
import { ClaudeKitBuilder } from "../../breadboard/ClaudeKitBuilder.js";
import ObjectKit from "../../kits/ObjectKit.js";
import JsonKit from "../../kits/JsonKit.js";
import StringKit from "../../kits/StringKit.js";
import { cliRunResultHandler } from "./cliRunResultHandler.js";

const runner = await BoardRunner.fromGraphDescriptor(board);

new CliAsyncGeneratorRunner(
	(): AsyncGenerator<RunResult, unknown> =>
		runner.run({
			kits: [
				asRuntimeKit(HackerNewsFirebaseKit),
				asRuntimeKit(HackerNewsAlgoliaKit),
				asRuntimeKit(Core),
				asRuntimeKit(ListKit),
				asRuntimeKit(ClaudeKitBuilder),
				asRuntimeKit(ObjectKit),
				asRuntimeKit(JsonKit),
				asRuntimeKit(StringKit),
			],
		}),
	cliRunResultHandler
).run();
