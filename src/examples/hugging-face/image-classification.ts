// import fs from "fs";
// import { board, base, code } from "@google-labs/breadboard";
// import { core } from "@google-labs/core-kit";
// import { HuggingFaceTask } from "./types.js";


// async function query(filename: string) {
//     const data = fs.readFileSync(filename);

//     const response = await fetch(
//         "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
//         {
//             headers: { Authorization: `Bearer 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` },
//             method: "POST",
//             body: data,
//         }
//     );

//     const result = await response.json();

//     return result;
// }

// // uses core.fetch, ERRORS HAPPENS BECAUSE CORE KIT CONVERTS BODY TO STRING 
// async function query2(filename: string) {
//     const data = fs.readFileSync(filename);

//     const response = await core.fetch({
//         headers: { Authorization: `Bearer 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` },
//         method: "POST",
//         body: data,
//         url: "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",

//     })

//     return response;
// }

// // query2("cat.jpg").then((response) => {
// //     fs.writeFileSync("./response-core.txt", JSON.stringify(response))
// //     console.log(JSON.stringify(response));
// // });

// query("cat.jpg").then((response) => {
//     //
//     console.log(JSON.stringify(response));
// });

// // const dataSchema = {
// //     type: "string",
// //     title: "data",
// //     default: "data",
// //     description: "The data to send to the hugging face api"
// // };


// // const keySchema = {
// //     type: "string",
// //     title: "apiKey",
// //     default: "myKey",
// //     description: "The hugging face api key"
// // };


// // export type HuggingFaceImageClassificationParams = {
// //     filePath: string
// // };


// // const authenticate = code<{ key: string }>((inputs) => {
// //     const key = inputs.key
// //     const auth = { Authorization: `Bearer ${key}` }

// //     return { auth };
// // });

// // const readImage = code<{ input: HuggingFaceImageClassificationParams}>((input) => {
// //     const {filePath} = input

// //     const payload = fs.readFileSync(filePath);

// //     return { payload }
// // })

// // const huggingFaceBoardTextGeneration = board(() => {
// //     const inputs = base.input({
// //         $id: "query",
// //         schema: {
// //             title: "Hugging Face Schema For Text 2 Text Generation",
// //             // TODO fix the schema
// //             properties: {
// //                 filePath: dataSchema,
// //                 apiKey: keySchema
// //             },
// //         },
// //         type: "string",
// //     })

// //     const task = HuggingFaceTask.imageClassification
// //     const output = base.output({ $id: "main" });

// //     const { auth } = authenticate({ key: inputs.apiKey as unknown as string })

// //     const { payload } = readImage(inputs)

// //     const response = core.fetch({
// //         headers: auth,
// //         method: "POST",
// //         body: payload,
// //         url: task
// //     })

   
// //     response.to(output)

// //     return { output}
// // })

// // const filePath = "cat.jpg"


// // console.log(
// //     JSON.stringify(await huggingFaceBoardTextGeneration({ filePath: filePath, apiKey: "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"}), null, 2)
// // );