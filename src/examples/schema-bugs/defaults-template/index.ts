import { board, base } from "@google-labs/breadboard";
import { templates } from "@google-labs/template-kit";
import path from "path";
import fs from "fs";

const inputSchema = {
    type: "number",
    title: "my Number",
    default: "1",
    description: "myNumber",
};

const serialized = await board(() => {
    const input = base.input({
        $id: "input",
        schema: {
            title: "My Inputs",
            properties: {
                myNumber: inputSchema,
            },
        },
        type: "number",
    })

    const urlTemplate = templates.urlTemplate({
        $id: "urlTemplate",
        template: "https://hn.algolia.com/api/v1/items/{myNumber}",
    });

    input.to(urlTemplate)

    return {output : urlTemplate.url}
}).serialize({
    title: "Board Defaults Not Used. urlTemplate Error",
    description: "Board which demonstrates a bug where breadboard web does not use default values and urlTemplate does not error if parameters are missing"
})

fs.writeFileSync(
	path.join(".", "board.json"),
	JSON.stringify(serialized, null, "\t")
);