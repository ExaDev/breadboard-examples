import { array, board, converge, input, loopback, output, serialize } from "@breadboard-ai/build";
import { asRuntimeKit, BoardRunner, GraphDescriptor } from "@google-labs/breadboard";
import Core, { code } from "@google-labs/core-kit";

const arrayInput = input({
  type: array("string"),
  title: "array input",
  default: ["What", "did", "the", "fox", "say?"]
})

// Loopback because we want to continue looping until the array is empty
const popLoopBack = loopback({ type: array("string") })

const pop = code({ $id: "Pop", array: converge(arrayInput, popLoopBack) }, { array: array("string"), item: "string" }, ({ array }) => {
  const [item, ...rest] = array;
  if (item) {
    return { array: rest, item: item } as any;
  }
  return {} as any;
})

// Loopback because we want to concatenate all of the elements in the array
const itemLoopBack = loopback({ type: "string" })

// set the value of the pop input array as the output array of the pop node 
popLoopBack.resolve(pop.outputs.array)
// set the value of the concat item as the removed element
itemLoopBack.resolve(pop.outputs.item)


const concat = code({ $id: "concat", item: itemLoopBack }, { modified: "string" }, ({ item }) => {
 
  return { modified: item.concat(" You have been modified by the concat node!!") }
})

const arrayLoop = loopback({ type: array("unknown") })

const accummulate = code({ $id: "Accummulate", item: concat.outputs.modified, array: converge([], arrayLoop) }, { array: array("string") }, ({ item, array }) => {
  return { array: [...array as [], item] } as any;
}).outputs.array

arrayLoop.resolve(accummulate)

const emitter = code({ $id: "Emitter", poppedArray: pop.outputs.array, accumulate: accummulate }, { emit: array("string"), a: array("string"), b: array("string") }, ({ poppedArray, accumulate }) => {
  let emit = undefined;

  if (!poppedArray || poppedArray.length === 0) {
    // @ts-ignore
    emit = accumulate;
  }
  
  // board wont return until output is set, so if it's undefined we will keep looping until the array is empty
  return { emit: emit } as any;
})

const boardInstance = board({
  title: "Board for each",
  version: "0.1.0",
  inputs: { array: arrayInput },
  outputs: { outputs: output(emitter.outputs.emit) }
})

const serialisedBoard: GraphDescriptor = serialize(boardInstance);

const runner: BoardRunner = await BoardRunner.fromGraphDescriptor(
  serialisedBoard
);

console.log(JSON.stringify(await runner.runOnce(
  { array: ["What", "did", "the", "fox", "say!"] }, { kits: [asRuntimeKit(Core)] }), null, 2))