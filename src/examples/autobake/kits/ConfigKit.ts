import { InputValues, NodeValue, OutputValues, code } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export function getAbsoluteFilePath(envPath: string = ".env"): string {
	if (!path.isAbsolute(envPath)) {
		envPath = path.join(process.cwd(), envPath);
	}
	return envPath;
}
export type getAbsoluteFilePath = typeof getAbsoluteFilePath;


const readEnv = code<{ path: string; }, OutputValues>(({ path }) => {
	if (path && !fs.existsSync(path)) {
		throw new Error(`Path "${path}" was explicitly specified but does not exist`);
	}

	const envPath = getAbsoluteFilePath(path || ".env");
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
	}
	return Promise.resolve(process.env);
  });


const readEnvVar = code<{key: string, path:string}, OutputValues>(async ({key, path}) => {
	const env = await readEnv({path});
	
	const value = env[key];
	if (value === undefined) {
		const absolutePath = getAbsoluteFilePath(path);
		throw new Error(`"${key}" not found in environment or "${absolutePath}"`);
	}
	return Promise.resolve({ [key]: env[key] });
})

export const ConfigKit = new KitBuilder({
	url: "npm:@exadev/breadboard-kits/kits/ConfigKit",
}).build({
	readEnv: async (path) => (
		{
			output: await readEnv(path)
		}
	),
	readEnvVar: async ({key, path}) => (
		{
			output: await readEnvVar({key: key as string, path:path as string})
		}
	)
});
export type ConfigKit = InstanceType<typeof ConfigKit>;
export default ConfigKit;