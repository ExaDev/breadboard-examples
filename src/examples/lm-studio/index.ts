import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";


type context = {
    role: string,
    content: string
}

type TheBlokeParams = {
    messages: context[],
    temperature: number,
    max_tokens: number,
    stream: boolean
}

const systemContextSchema = {
    type: "string",
    title: "system context",
    default: "default",
    description: "context of the system"
}

const userContextSchema = {
    type: "string",
    title: "user context",
    default: "default",
    description: "context of the user"
}

const systemRoleSchema = {
    type: "string",
    title: "system role",
    default: "system",
    description: "role of the system"
}

const userRoleSchema = {
    type: "string",
    title: "user context",
    default: "user",
    description: "role of the user"
}

const temperatureSchema = {
    type: "number",
    title: "temperature",
    default: "1.0",
    description: "The temperature of the sampling operation. 1 means regular sampling, 0 means always take the highest score, 100.0 is getting closer to uniform probability"
};

const maxTokenSchema = {
    type: "number",
    title: "max token",
    default: "1.0",
    description: ""
};

const streamSchema = {
    type: "boolean",
    title: "stream",
    default: "false",
    description: "Boolean to indicate if the model should stream the answer as it is being constructed"
}

const handleParams = code<{ systemRole: string, userRole: string, systemContext: string, userContext: string, temperature: number, max_tokens: number, stream: boolean }>((input) => {
    const { systemRole, userRole, systemContext, userContext, temperature, max_tokens, stream } = input

    const context1: context = { role: systemRole, content: systemContext }
    const context2: context = { role: userRole, content: userContext }

    const payload: TheBlokeParams = {
        messages: [context1, context2],
        temperature: temperature,
        max_tokens: max_tokens,
        stream: stream,
    }

    console.log("payload", payload)

    return { payload }
});

// this assumes LM studio is running the following model on localhost:1234
// https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
// CHANGE URL TO JUST HTTP://LOCALHOST:1234 IF RUNNING OUTSIDE OF A DEV CONTAINER
const myBoard = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "LM Studio Schema for https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
            properties: {
                systemContext: systemContextSchema,
                systemRole: systemRoleSchema,
                userContext: userContextSchema,
                userRole: userRoleSchema,
                temperature: temperatureSchema,
                maxToken: maxTokenSchema,
                stream: streamSchema
            },
        },
        type: "string",
    });

    const url = "http://host.docker.internal:1234/v1/chat/completions"
    const output = base.output({ $id: "main" });

    const { payload } = handleParams({
        systemContext: inputs.systemContext.isString(),
        userContext: inputs.userContext.isString(),
        systemRole: inputs.systemRole.isString(),
        userRole: inputs.userRole.isString(),
        temperature: inputs.temperature.isNumber(),
        max_tokens: inputs.max_tokens.isNumber(),
        steam: inputs.stream.isBoolean()
    });

    const response = core.fetch({
        headers: { "content-type": "application/json" },
        method: "POST",
        body: payload,
        url: url
    });

    response.to(output);
    return { output }
});


console.log(JSON.stringify(await myBoard({ 
    systemContext: "You are a professional chef^",
    userContext: "Return to me a list of ingredients I need to make a cake",
    systemRole: "system",
    userRole: "user",
    temperature: 1,
    max_tokens: -1,
    stream: false }), null, 2));
