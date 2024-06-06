

import { board, base, code } from "@google-labs/breadboard";
import path from "path";
import fs from "fs"

const numberRequiredSchema = {
    type: "number",
    title: "number_required",
    default: "1",
    description: "Required number input"
}

const numberNonRequiredSchema = {
    type: "number",
    title: "number_non-required",
    default: "2",
    description: "Non-Required number input"
}

const handleParams = code<{ num_required: number, num_non_required: number }>((input) => {
    const { num_required, num_non_required } = input

    const payload = { num_required: num_required, num_non_required: num_non_required }

    return { payload }
});

const serialized = await board(() => {
    const inputs = base.input({
        $id: "inputs",
        schema: {
            title: "Bugged Schema Type",
            properties: {
                number_required: numberRequiredSchema,
                number_non_required: numberNonRequiredSchema
            },
            required: ["number_required"]
        }
    })

    const output = base.output();

    const data = handleParams({ num_required: inputs.number_required as unknown as number, num_non_required: inputs.number_non_required as unknown as number })

    data.to(output)

    return { output }
}).serialize({
    title: "Schema Bug Demonstration",
    description: "Board which demonstrates type convertion bug"
});

fs.writeFileSync(
    path.join(".", "board.json"),
    JSON.stringify(serialized, null, "\t")
);