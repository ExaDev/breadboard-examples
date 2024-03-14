import { BoardRunner, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import { ClaudeKit, ConfigKit, ObjectKit, StringKit } from "@exadev/breadboard-kits";
import featureKit from "./featurekit.js";


const kitInstance = addKit(featureKit)
const claudeKit = addKit(ClaudeKit);
