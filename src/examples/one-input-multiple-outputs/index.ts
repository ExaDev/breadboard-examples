import { base, board, BoardRunner, InputValues } from "@google-labs/breadboard";
import { merMake } from "../../util/merMake.js";

const myBoardSerialized = await board<InputValues>(
  // (inputs, { output }) => {
  (inputs) => {

    const { partOne, partTwo } = inputs;

    const outputOne = base.output({
      $id: "outputOne",
      schema: {
        type: "object",
        properties: {
          outputMessageOne: { type: "string" },
        },
      },
    });

    const outputTwo = base.output({
      $id: "outputTwo",
      schema: {
        type: "object",
        properties: {
          outputMessageTwo: { type: "string" },
        },
      },
    });

    const outputThree = base.output({
      $id: "outputThree",
    });

    partOne.as("outputMessageOne").to(outputOne);
    partTwo.as("outputMessageTwo").to(outputTwo);

    outputOne.to(outputThree)
    outputTwo.to(outputThree)

    // return { outputOne, outputTwo };
    // return output({ outputOne, outputTwo });
    return outputThree;
  }
).serialize({
  title: "My Board Serialized",
  description: "This is my board after serialization.",
  url: ".",
});

const runner = await BoardRunner.fromGraphDescriptor(myBoardSerialized);

for await (const stop of runner.run()) {
  if (stop.type === "input") {
    stop.inputs = {
      partOne: "Hello Input Part One",
      partTwo: "Hello Input Part Two",
    };
  } else if (stop.type === "output") {
    if (stop.node.id === "outputOne") {
      console.log("outputOne", JSON.stringify(stop.outputs, null, 2));
    } else if (stop.node.id === "outputTwo") {
      console.log("outputTwo", JSON.stringify(stop.outputs, null, 2));
    }
  }
}

await merMake({
  graph: myBoardSerialized,
  destination: import.meta.dirname,
});
