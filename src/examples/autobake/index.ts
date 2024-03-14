import { BoardRunner, addKit, asRuntimeKit, board, code } from "@google-labs/breadboard";
import { KitBuilder } from "@google-labs/breadboard/kits";
import Core from "@google-labs/core-kit";
import { ConfigKit, ObjectKit, StringKit, ClaudeKit as clad } from "@exadev/breadboard-kits";
import featureKit from "./featurekit.js";
import StringKit from "./kits/StringKit.js"

import {ClaudeKit as myKit} from "./kits/ClaudeKit.js"

const kitInstance = addKit(featureKit)
const claudeKit = addKit(myKit);
const cladKit = addKit(clad)
const coreKit = addKit(Core)