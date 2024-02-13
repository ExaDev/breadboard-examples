import { GraphDescriptor, Lambda, toMermaid } from "@google-labs/breadboard";
import fs from "fs";
import path from "path";

export async function merMake({ graph, destination: output = process.cwd() }: {
	graph: GraphDescriptor | Lambda<any, any>,
	destination?: string;
}) {
	if (fs.lstatSync(output).isDirectory()) {
		output = path.join(output, "README.md");
	} else {
		output = path.join(path.dirname(output), "README.md");
	}
	output = path.resolve(output);

	if (typeof graph === "function") {
		graph = await graph.serialize();
	}
	const mermaid = toMermaid(graph);
	const condeFence = ["## Mermaid", "```mermaid", mermaid, "```"];
	const json = JSON.stringify(graph, null, 2);
	const jsonCodeFence = ["## JSON", "```json", json, "```"];
	console.debug("Writing to", output);
	fs.writeFileSync(output, [
		condeFence.join("\n"),
		jsonCodeFence.join("\n"),
	].join("\n\n"));
}
