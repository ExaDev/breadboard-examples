#! /usr/bin/env npx -y tsx

import Core, { core } from "@google-labs/core-kit";
import graph from "./hello-world.js"
import { BoardRunner, GraphDescriptor, asRuntimeKit, base, code } from "@google-labs/breadboard";

const concat = code<{string1: string, string2: string}>((inputs) => {
    const {string1, string2} = inputs

    const concatResult = string1.concat(string2)
    return {result: concatResult}
});

// Invokes our Hello World board and returns the "Hello World" as the output
const invocation = core.invoke({
    $metadata: { title: "Invoke Hello World Board" },
    $board: graph,
    message: "Hello World"
  });

const output = base.output();
// Takes the output from the Hello World Board and concatenates it with a string
const {result} = concat({string1: invocation.output.isString(), string2: " from the wrapper!"})

// Returns concat result as board output
result.to(output)

const serialised = await output.serialize({
    title: "Core Kit Invoke Example",
  });

  const runner = await BoardRunner.fromGraphDescriptor(serialised as GraphDescriptor);
for await (const stop of runner.run({kits: [asRuntimeKit(Core)] })) {
    if (stop.type === "output") {
        console.log(JSON.stringify(stop.outputs, null, 2));
    }
}