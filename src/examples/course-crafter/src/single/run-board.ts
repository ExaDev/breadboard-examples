import { BoardRunner, RunResult, asRuntimeKit } from "@google-labs/breadboard";
import { CliAsyncGeneratorRunner } from "../breadboard/cli-async-generator-runner.js";
import board from "../single/index.js";
import { courseCrafterRunResultHandler } from "./course-crafter-result-handler.js";
import CourseCrafterKit from "../breadboard/kits/CourseCrafterKit.js";
import XenovaKit from "../breadboard/kits/XenovaKit.js";
import StringKit from "../breadboard/kits/StringKit.js";
import ClaudeKit from "../breadboard/kits/ClaudeKit.js";
import ConfigKit from "../breadboard/kits/ConfigKit.js";

const runner = await BoardRunner.fromGraphDescriptor(board);

new CliAsyncGeneratorRunner(
	(): AsyncGenerator<RunResult, unknown> =>
		runner.run({
			kits: [
				asRuntimeKit(CourseCrafterKit),
				asRuntimeKit(XenovaKit),
				asRuntimeKit(ClaudeKit),
				asRuntimeKit(StringKit),
				asRuntimeKit(ConfigKit),
			],
		}),
	courseCrafterRunResultHandler
).run();
