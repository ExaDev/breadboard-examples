import { base, board } from "@google-labs/breadboard";
import { merMake } from "../../util/merMake.js";

const myBoard = board<{ messageOne: string }>(({ messageOne }) => {
  const inputNodeTwo = base.input({
    $id: "inputTwo",
    schema: {
      type: "object",
      properties: {
        messageTwo: { type: "string" },
      },
    },
  });

  const inputNodeThree = base.input({
    $id: "inputThree",
    schema: {
      type: "object",
      properties: {
        messageThree: { type: "string" },
      },
    },
  });

  const outputNode = base.output({
    $id: "output",
    schema: {
      type: "object",
      properties: {
        partOne: { type: "string" },
        partTwo: { type: "string" },
        partThree: { type: "string" },
      },
    },
  });

  messageOne.as("partOne").to(outputNode);
  inputNodeTwo.messageTwo.as("partTwo").to(outputNode);
  inputNodeThree.messageThree.as("partThree").to(outputNode);

  return outputNode;
});

console.log(
  JSON.stringify(
    await myBoard({messageOne: "Hello", messageTwo: "Breadboard", messageThree: "!",}),
    null,
    2
  )
);

await merMake({
  graph: myBoard,
  destination: import.meta.dirname,
});
