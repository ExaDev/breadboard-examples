
import { BoardRunner, board, addKit, asRuntimeKit, InputValues, base,code, OutputValues } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";

export function parametersFromTemplate(template: string): string[] {
	const matches = template.matchAll(/{{(?<name>[\w-]+)}}/g);
	const parameters = Array.from(matches).map(
		(match) => match.groups?.name || ""
	);
	return Array.from(new Set(parameters));
}

export const stringify = (value: unknown): string => {
	if (typeof value === "string") return value;
	if (value === undefined) return "undefined";
	return JSON.stringify(value, null, 2);
};

export function substitute(template: string, values: InputValues) {
	return Object.entries(values).reduce(
		(acc, [key, value]) => acc.replace(`{{${key}}}`, stringify(value)),
		template
	);
}

const concat = code<{ input: string[]; }, OutputValues>(({ input }) => {
	return { output: input.join("") };
  });


const template2 = code<{inputs: InputValues,  template:string}, OutputValues>(({ inputs, template }) =>  {
	const parameters = parametersFromTemplate(template);
	
	if (!parameters.length) return { string: template };

	const substitutes = parameters.reduce((acc, parameter) => {
		if (inputs[parameter] === undefined)
			throw new Error(`Input is missing parameter "${parameter}"`);
		return { ...acc, [parameter]: inputs[parameter] };
	}, {});

	const string = substitute(template, substitutes);

	return Promise.resolve({ string });
});


export const StringKit = new KitBuilder({
	url: "npm:@exadev/breadboard-kits/kits/StringKit",
}).build({
	concat: async (list) => (
        {
            output: await concat(list)
        }
),
template: async(inputs, template) => (
	{
		output: await template2({inputs:inputs, template:template as string})
	}
)

});

const kitInstance = addKit(StringKit); 

const kitBoard = board<{ input: string[]}>(
	({input}) => {
	const output = kitInstance.concat(input)
    return {output};
});

const serializedBoard = await kitBoard.serialize({
    title: "Xenova Code Node-Kit Board",
    description: "Board which performs sentiment analysis using xenova LLM",
    url: ".",
})

// running board from json and providing kit at runtime
const runner = await BoardRunner.fromGraphDescriptor(serializedBoard);
for await (const stop of runner.run({ kits: [asRuntimeKit(StringKit)] })) {
    if (stop.type === "input") {
        stop.inputs = {
            input: ["a", "b", "c", "d"]
        };
    } else if (stop.type === "output") {
        console.log("output with Kit", JSON.stringify(stop.outputs, null, 2));
    }
}

export type StringKit = InstanceType<typeof StringKit>;
export default StringKit;