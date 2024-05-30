import { InputValues, NodeValue, OutputValues, code } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";


const pick = code<{ object: Record<string, NodeValue>, key: string; }, OutputValues>(({ object, key }) => {
	const { [key]: value, ...rest } = object;
	return Promise.resolve({
		value,
		rest,
	});
});

const pickSeveral = code<{ object: Record<string, NodeValue>, keys: string[]; }, OutputValues>(({ object, keys }) => {
	const values = {};
	for (const key of keys) {
		const { [key]: value, ...rest } = object;
		values[key] = value;
		object = rest;
	}
	return Promise.resolve({
		...values,
		rest: object,
	});
})

const spread = code<{ object: Record<string, NodeValue> }, OutputValues & { [key: string]: NodeValue; }>(({ object }) => {
	return Promise.resolve({
		...object,
	});
})

const nest = code<{ inputs: InputValues, key: string }, OutputValues>(({ inputs, key }) => {
	const { ...rest } = inputs;
	return Promise.resolve({
		[key]: rest,
	})
})

const limitDepthCall = code<{ object: Record<string, NodeValue>, depth: number }, OutputValues>(({ object, depth }) => {
	return Promise.resolve({
		object: limitDepth(object, depth),
	});
})

export const ObjectKit = new KitBuilder({
	url: "npm:@exadev/breadboard-kits/kits/ObjectKit",
}).build({
	pick: async ({ object, key }) => ({
		output: await pick({ object: object as Record<string, NodeValue>, key: key as string })
	}),
	pickSeveral: async ({ object, keys }) => ({
		output: await pickSeveral({ object: object as Record<string, NodeValue>, keys: keys as string[] })
	}),
	spread: async ({ object }) => ({
		output: await spread({ object: object as Record<string, NodeValue> })
	}),
	nest: async ({ inputs, key }) => ({
		output: await nest({ inputs: inputs as InputValues, key: key as string })
	}),
	limitDepth: async ({ object, depth }) => ({
		output: await limitDepthCall({ object: object as Record<string, NodeValue>, depth: depth as number })
	})
});

// Wrapper function to limit the depth of an object
export function limitDepth(obj: AnyObject, maxDepth: number): AnyObject {
	const currentDepth = calculateDepth(obj);
	if (currentDepth > maxDepth) {
		return reduceDepth(obj, maxDepth);
	}
	return obj; // Return the object as is if it's within the depth limit
} // Function to reduce the depth of an object
function reduceDepth(obj: AnyObject, maxDepth: number): AnyObject {
	function reduce(obj: AnyObject, currentDepth: number): AnyObject {
		if (currentDepth === maxDepth) {
			return Array.isArray(obj) ? [] : {};
		}

		const result: AnyObject = Array.isArray(obj) ? [] : {};

		for (const key in obj) {
			if (typeof obj[key] === "object" && obj[key] !== null) {
				result[key] = reduce(obj[key], currentDepth + 1);
			} else {
				result[key] = obj[key];
			}
		}

		return result;
	}

	return reduce(obj, 0);
}

function calculateDepth(obj: AnyObject, currentDepth: number = 0): number {
	if (typeof obj !== "object" || obj === null) {
		return currentDepth;
	}

	let maxDepth = currentDepth;
	for (const key in obj) {
		if (typeof obj[key] === "object" && obj[key] !== null) {
			
			const depth = calculateDepth(obj[key], currentDepth + 1);
			if (depth > maxDepth) {
				maxDepth = depth;
			}
		}
	}

	return maxDepth;
}
//////////////////////////////////////////////////
export interface AnyObject {
	[key: string]: any;
}

export type ObjectKit = InstanceType<typeof ObjectKit>;
export default ObjectKit;
