
import { BoardRunner, board, addKit, asRuntimeKit, InputValues, base, code, OutputValues, NodeValue } from "@google-labs/breadboard";
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

const templatePrompt = code<{ selectedFeature: string, featureResources: string, template: string }, OutputValues>(({selectedFeature, featureResources , template }) => {
	const parameters = parametersFromTemplate(template);
	const selectedInput = selectedFeature["filtered"]
	const resourcesInput = featureResources["resources"]

	if (!parameters.length) return { string: template };
	const substitutes = parameters.reduce((acc, parameter) => {
		if (selectedFeature === undefined || featureResources === undefined)
			throw new Error(`Input is missing parameter "${parameter}"`);
		const inputs = {"selectedFeature": selectedInput, "featureResources": resourcesInput }
		return { ...acc, [parameter]: inputs[parameter] };
	}, {});

	const string = substitute(template, substitutes);
	return Promise.resolve({ string });
});

export const StringKit = new KitBuilder({
	url: ".",
}).build({
	concat: async ({list}) => (
		{
			output: await concat({input: list as string[]})
		}
	),
	template: async ({selectedFeature, featureResources, template}) => (
		{
			output: await templatePrompt({ selectedFeature: selectedFeature as string, featureResources: featureResources as string,  template: template as string })
		}
	)
});

export type StringKit = InstanceType<typeof StringKit>;
export default StringKit;