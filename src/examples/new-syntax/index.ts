import { input, board, output } from "@breadboard-ai/build";
import { BoardRunner, GraphDescriptor } from "@google-labs/breadboard";
import { code } from "@google-labs/core-kit";

const text = input({
    type: "string",
    title: "Text",
    description: "The text to output",
    examples: ["What is the square root of pi?"],
    default: "What is the square root of pi?",
  });

const message = code(
  {
    $id: "text",
    $metadata: {
        title: "text",
        description: "my message to return",
      },
    text,
  },
  {
    message: "string",
  },
  ({ text }) => {
    return { message: text };
  }
);

const myBoard = board({
    title: "MY HELLO WORLD BOARD",
    inputs: { text },
    outputs: {
        message: output(message.outputs.message, {
            title: "Hello World Output",
            description: "The generated tool calls",
        })
    }
});


const runner = await BoardRunner.fromGraphDescriptor(myBoard as unknown as GraphDescriptor);
for await (const stop of runner.run({ kits: [] })) {
    if (stop.type === "input") {
        stop.inputs = {
          text: "myMessage",
        };
    } else if (stop.type === "output") {
        console.log("output with Kit", JSON.stringify(stop.outputs, null, 2));
    }
}

