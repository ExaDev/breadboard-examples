import {
    BoardRunner,
    Schema,
    asRuntimeKit,
    base,
    board,
    code,
  } from "@google-labs/breadboard";
  import { RunConfig, run } from "@google-labs/breadboard/harness";
  import Core from "@google-labs/core-kit";
  
  const myBoard = await board(() => {
    const concat = code(
      ({
        myString1 = "One",
        myString2 = "Two",
      }: {
        myString1: string;
        myString2: string;
      }) => {
        const output = ((myString1 as string) + myString2) as string;
        return { output };
      }
    );
    const input = base.input({
      $id: "concat",
      schema: {
        title: "Concat Inputs",
        properties: {
          string1: {
            type: "string",
            title: "String 1",
            default: "String 1 default",
            description: "String to concat",
          } satisfies Schema,
          string2: {
            type: "string",
            title: "String 2",
            default: "String 2 default",
            description: "String to concat",
          } satisfies Schema,
        },
        required: ["string2"],
        default: JSON.stringify({
          string1: "String 1 default",
          string2: "String 2 default",
        }),
      } satisfies Schema,
    });
  
    const { output } = concat({
      myString1: input.string1,
      myString2: input.string2,
    });
  
    return { output };
  }).serialize({
    title: "Schema Bug",
    description:
      "Board which demonstrates schema defaults not being used on required properties.",
    version: "0.0.1",
  });
  export default myBoard;
  // 
  const kits = [asRuntimeKit(Core)];
  const inputs = {
    //string1: "One",
    string2: "Two",
  };
  const runner = await BoardRunner.fromGraphDescriptor(myBoard);
  
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
    } else {
      console.debug("else");
      console.debug(runResult);
      console.debug();
    }
  }

  console.log("=".repeat(80));
  // this SHOULD return "This is default" because we are using a default, but it does not return the result as expected
  for await (const stop of runner.run({ kits: kits })) {
    if (stop.type === "input") {
      stop.inputs = {
        string1: "This is ",
      };
    } else if (stop.type === "output") {
      console.log(stop.outputs);
    }
  }
  
  const runner2 = await BoardRunner.fromGraphDescriptor(myBoard);
  for await (const stop of runner2.run({ kits: kits })) {
    if (stop.type === "input") {
      stop.inputs = {
        string1: "This is ",
        string2: "not the default",
      };
    } else if (stop.type === "output") {
      console.log(stop.outputs);
    }
  }
  