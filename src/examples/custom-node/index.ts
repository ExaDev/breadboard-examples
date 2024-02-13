#! /usr/bin/env npx -y tsx

import { board, code } from "@google-labs/breadboard";
import { merMake } from "../../util/merMake.js";

const greet = code<{ name: string }>(({ name }) => {
  const greeting = "Hello ".concat(name).concat("!");
  return { greeting };
});

const myBoard = board<{ name: string }>(({ name }) => {
  const greetNode = greet({ name });
  return { greeting: greetNode.greeting };
});

console.log(JSON.stringify(await myBoard({ name: "Jim" }), null, 2));

await merMake({
  graph: myBoard,
  destination: import.meta.dirname,
});
