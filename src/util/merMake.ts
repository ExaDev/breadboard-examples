import { GraphDescriptor, GraphMetadata, Lambda, toMermaid } from "@google-labs/breadboard";
import fs from "fs";
import path from "path";

export async function makeFiles({ graph, metadata, destination: output = process.cwd() }: {
	graph: GraphDescriptor | Lambda<any, any>,
	metadata?: GraphMetadata,
	destination?: string;
}) {
	if (fs.lstatSync(output).isDirectory()) {
		output = path.join(output, "README.md");
	} else {
		output = path.join(path.dirname(output), "README.md");
	}
	output = path.resolve(output);

	if (typeof graph === "function") {
		graph = await graph.serialize(metadata);
	}
	const mermaid = toMermaid(graph);
	const condeFence = ["## Mermaid", "```mermaid", mermaid, "```"];
	const json = JSON.stringify(graph, null, "\t");
	const jsonCodeFence = ["## JSON", "```json", json, "```"];
	console.debug("Writing to", output);
	fs.writeFileSync(output, [
		metadata?.title ? `# ${metadata.title}` : undefined,
		metadata?.description ? `> ${metadata.description}` : undefined,
		condeFence.join("\n"),
		jsonCodeFence.join("\n"),
	].filter(Boolean).join("\n\n"));

	const outputDir = path.dirname(output);
	const jsonFile = path.join(outputDir, "graph.json");
	fs.writeFileSync(jsonFile, json);
}
