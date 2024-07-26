# Cycles and Loops

Loops and cycles are an essential part of programming. We will demonstrate how to do this using `converge` and `loopback`. We will also demonstrate how to accumulate and output results from our loops and cycles.


## Loopback and Converge

Occasionally it is desirable to create a board with cycles. However, instantiating a node normally requires immediately providing a value for all inputs. This is a problem because when building a cycle, there will always be an input which needs to be connected to an output which has not yet been initialized, and so cannot be referenced.

For such situations involving cycles, the `loopback` function is used to create an object whose value will be provided at some later time, namely with the missing link in the cycle.

Now that we know how to create cycles within our boards, how do we create a cycle with an initialized input?
This can be done using the `converge` function. Below we can see a cycle on our `pop` node. This cycle allows to loop through an array until all elements have been removed. The `converge` function allows us to provide the initial input but also accept additional input which may have no been yet initialized.


```TS
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

```

## Use Case

In this simple example, we are looping through an array. For each element in the array we are concatenating "You have been modified by the concat node!!"

```TS
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
```



## Accumulate
The next step is a way for our board to accummulate results for every iteration of the cycle. This can be done using the following node: 

```TS
const accummulate = code({ $id: "Accummulate", item: concat.outputs.modified, array: converge([], arrayLoop) }, { array: array("string") }, ({ item, array }) => {
  return { array: [...array as [], item] } as any;
}).outputs.array

arrayLoop.resolve(accummulate)
```
What this node does is take output of our `concat` node and append to an array. The array contains results from any other iteration of our cycle. 


## Emitter
Now that we have a way to accumulate our results, we can't simply return the output of the `accummulate` node. This is because after the first iteration, our board will return with the result, meaning only 1 cycle was completed.

```TS
const boardInstance = board({
  title: "Board for each",
  version: "0.1.0",
  inputs: { array: arrayInput },
  outputs: { outputs: output(accummulate) }
})
```

We need a way of knowing all iterations have completed before returning a result. This can be done using the following:

```TS
const emitter = code({ $id: "Emitter", poppedArray: pop.outputs.array, accumulate: accummulate }, { emit: array("string"), a: array("string"), b: array("string") }, ({ poppedArray, accumulate }) => {
  let emit = undefined;

  if (!poppedArray || poppedArray.length === 0) {
    emit = accumulate;
  }
  
  return { emit: emit } as any;
})
```

This node checks if the our input array still has elements inside. If it does it will return the output is undefined, because of this the output of emitter will even be initialized when we no longer have elements inside our input array, meaning all iterations of the cycle has been completed.


## Complete Example

```TS
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

// set the new value of the pop input array as the output array of the pop node 
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
    emit = accumulate;
  }
  
  // board wont return until output is initialized, so if it's undefined we will keep looping until the array is empty
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
```

#### Output

```
{
  "outputs": [
    "What You have been modified by the concat node!!",
    "did You have been modified by the concat node!!",
    "the You have been modified by the concat node!!",
    "fox You have been modified by the concat node!!",
    "say! You have been modified by the concat node!!"
  ]
}
```