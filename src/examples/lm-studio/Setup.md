# Breadboard and LM Studio

LM Studio allows us to run our own LLM locally. This is great for experimenting with breadboard, not only do we get to choose which LLM to use, but it also means we don't require API keys. This document will show us how to set up LM studio and use Breadboard to interact with it.

## LM Studio

For this demonstration, we need to download [LM Studio](https://lmstudio.ai/) onto our machine.

Documentation regarding setup  of LM Studio can be found [here](https://lmstudio.ai/docs/local-server). We only need to follow steps 1-5 in the `Using the local server` section

In this demonstration we will be using the [Mistral 7B Instruct v0.2 - GGUF model](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF). This is the same model used in the LM studio setup. The version of the model we have downloaded is `mistal-7b-instruct-v0.2.Q4_0.gguf`, however this should work with any version of the model.

For a greater selection of models, a model can be selected on the [Hugging Face Website](https://huggingface.co/models?sort=downloads). Simply copy the link to the model and paste it into `search` on the LM Studio toolbar. Request formats are usually found with documentation on the model page.

## Breadbobard Integration

Now that everything is setup we will now put together a board which can interact with our LLM Endpoint.

#### Request Parameters

We will be sending requests to our LLM endpoint using the `core-kit`. Therefore we need to know the structure of the request that is expected by the LLM.
We can then define our own data structures to implement the request we will send.

This is an example of a `curl` request for the model we are using.
```
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{ 
    "model": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
    "messages": [ 
      { "role": "system", "content": "Always answer in rhymes." },
      { "role": "user", "content": "Introduce yourself." }
    ], 
    "temperature": 0.7, 
    "max_tokens": -1,
    "stream": true
}'
```

With this information we can then define the request accordingly:
```Typescript

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

```
#### Schema
Now that we know what kind of inputs we are expecting, we can create an input schema:

```Typescript

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

```
#### Constructing Request Payload
We also need a helper function which will take these inputs and construct the request:

```Typescript

const buildRequest = code<{ systemRole: string, userRole: string, systemContext: string, userContext: string, temperature: number, max_tokens: number, stream: boolean }>((input) => {
    const { systemRole, userRole, systemContext, userContext, temperature, max_tokens, stream } = input

    const context1: context = { role: systemRole, content: systemContext }
    const context2: context = { role: userRole, content: userContext }

    const payload: TheBlokeParams = {
        messages: [context1, context2],
        temperature: temperature,
        max_tokens: max_tokens,
        stream: stream,
    }

    return { payload }
});

```
#### The Board
We now have all the components we need to create a board that can interact with LM Studio.

#### NOTE this example runs in a Dev Container. If running a board outside a Dev/Docker container use http://localhost:1234/v1/chat/completions instead for the URL.

```Typescript
import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";

// Schema definitions ...
// request definitions ...

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

    const { payload } = buildRequest({
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

```

Example output:
```
node ➜ .../breadboard-examples/src/examples/lm-studio (LLM-Studio-Boards) $ npx tsx index.ts 
payload {
  messages: [
    { role: 'system', content: 'You are a professional chef^' },
    {
      role: 'user',
      content: 'Return to me a list of ingredients I need to make a cake'
    }
  ],
  temperature: 1,
  max_tokens: -1,
  stream: undefined
}
{
  "response": {
    "id": "chatcmpl-5337p39dzhfook2qvvaaf",
    "object": "chat.completion",
    "created": 1717056791,
    "model": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF/mistral-7b-instruct-v0.2.Q4_0.gguf",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": " To make a standard vanilla cake, here is a list of essential ingredients:\n\n1. All-purpose flour (2 1/4 cups or 280 grams)\n2. Granulated sugar (1 1/2 cups or 300 grams)\n3. Unsalted butter at room temperature (1 cup or 2 sticks or 226 grams)\n4. Eggs, large, room temperature (3 whole and 3 egg whites)\n5. Milk, whole, room temperature (1/2 cup or 118 ml)\n6. Vanilla extract, pure (1 teaspoon)\n7. Baking powder (2 1/4 teaspoons or 9 grams)\n8. Baking soda (1 teaspoon or 5 grams)\n9. Salt (1/2 teaspoon or 3 grams)\n\nYou may also need optional ingredients, such as:\n\n* Lemon zest for a lemon cake\n* Almond extract and almond flour for an almond cake\n* Chocolate chips for a chocolate chip cake\n\nThese ingredients will yield a traditional 9x13 inch vanilla cake, and adjustments may be needed depending on your specific recipe."
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 27,
      "completion_tokens": 273,
      "total_tokens": 300
    }
  }
}
```

