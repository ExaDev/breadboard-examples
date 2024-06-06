import { board, code } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";


const webGPUKit = new KitBuilder({ url: "", version: "1.0.0" }).build({

})

const processVertices = code<{ vertices: number[] }>((input) => {
    const { vertices } = input

    const shape = new Float32Array(vertices)

    return { shape }
})


export const serialized = board(() => {
    // const canvas = document.querySelector("canvas");
    
    // if (!navigator.gpu) {
    //   throw new Error("WebGPU not supported on this browser.");
    // } 

    console.log("OK")

})

console.log("HERE")
console.log(JSON.stringify(await serialized({ }), null, 2));