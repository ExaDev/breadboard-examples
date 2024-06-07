# Breadboard and Ollama

Ollama allows us to run LLMs locally. This is great for experimenting with breadboard, not only do we get to choose which LLM to use, but it also means we don't require API keys. This document will show us how to set up LM studio and use Breadboard to interact with it.

## OLLAMA

For this demonstation, we need to download [Ollama](https://ollama.com/). Once we have Ollama installed we can run our server locally and start using a language model of our choice. For a full list of models see [here](https://ollama.com/library). In this example we will be using the `llama3` model.

### Starting the server

From a command line, we can start our Ollama server using the `ollama run llama3` command

## Breadboard Integration

Now that everything is setup, we will now create a board which can interact with our Ollama Server.

### Request Parameters

We will be sending to our server using the `core-kit`. Therefore we need to know the structure of the requests that is expected by the server.

An example of a request to Ollama Server using `curl`.

```
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt":"Why is the sky blue?"
 }'
```

We this information, we can define our own data structures to implement the request we will send:

```Typescript

type OllamaRequest = {
    model: string 
    prompt: string
    stream: boolean
}
```

### Schema 
Now that we know what kind of inputs we are expecting, we can create an input schema:

```Typescript

const modelSchema = {
    type: "string",
    title: "Ollama Model",
    default: "llama3",
    description: "The Ollama model to respond to the prompt"
}

const promptSchema = {
    type: "string",
    title: "Prompt",
    default: "Why is the sky blue?",
    description: "Prompt to ask Ollama Model"
}
```

### Constructing Request Payload

We also need a helper function which will take these inputs and construct the request:

```Typescript
const buildRequest = code<{ model: string, prompt: string, stream: boolean}>((input) => {
    const payload: OllamaRequest = input

    console.log("payload", payload)

    return { payload }
});

```

### The Board

We now have all the components we need to create a board that can interact with the Ollama Server.

NOTE: This board has only been tested with the following models: `llama3`, `phi3`, `mistral` and `gemma`.


```Typescript
import { board, base, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";


type Ollama3Request = {
    model: string 
    prompt: string
    stream: boolean
}

const modelSchema = {
    type: "string",
    title: "Ollama Model",
    default: "llama3",
    description: "The Ollama model to respond to the prompt"
}

const promptSchema = {
    type: "string",
    title: "Prompt",
    default: "What are the continents called?",
    description: "Prompt to ask Ollama Model"
}


const buildRequest = code<{ model: string, prompt: string, stream: boolean}>((input) => {
    const payload: Ollama3Request = input

    console.log("payload", payload)

    return { payload }
});

// this assumes Ollama is running on localhost:1234
// board has been tested with Llama3, Phi3, Mistral and Gemma
// simply change the "model" input to select the desired model
// CHANGE URL TO JUST HTTP://LOCALHOST:11434 IF RUNNING OUTSIDE OF A DEV CONTAINER
const llamaBoard = board(() => {
    const inputs = base.input({
        $id: "query",
        schema: {
            title: "Inputs for Ollama3 API call",
            properties: {
                model: modelSchema,
                prompt: promptSchema,
            },
        },
        type: "string",
    });

    const url = "http://host.docker.internal:11434/api/generate"
    const output = base.output({ $id: "main" });

    const { payload } = buildRequest({
        model: inputs.model.isString(),
        prompt: inputs.prompt.isString(),
        stream: false,
    })

    const response = core.fetch({
        headers: { "content-type": "application/json" },
        method: "POST",
        body: payload,
        url: url
    });

    response.to(output);
    return { output }
});


console.log(JSON.stringify(await llamaBoard({model:"llama3", prompt :"Return me a list of all the world's continents", stream: false }), null, 2));
```


### Example Output
```JSON
{
  "response": {
    "model": "llama3",
    "created_at": "2024-05-31T10:06:32.1012568Z",
    "response": "There are generally considered to be 7 continents:\n\n1. **Africa**\n2. **Antarctica** (note: sometimes considered a single continent with several regions, e.g., East Antarctica and West Antarctica)\n3. **Asia**\n4. **Australia/Oceania** (note: some sources consider Australia and Oceania as separate continents; others combine them into one)\n5. **Europe**\n6. **North America**\n7. **South America**\n\nSome definitions of a continent may group Europe and Asia together as a single continent, Eurasia, or combine North and South America as the Americas. Additionally, some sources consider the Arctic region to be a separate continent.\n\nHere's a brief description of each:\n\n1. Africa: Home to over 50 countries, including Egypt, Nigeria, and South Africa.\n2. Antarctica: An icy, frozen continent with no permanent residents (only scientists at research stations).\n3. Asia: The largest and most populous continent, featuring countries like China, India, Japan, and Indonesia.\n4. Australia/Oceania: A vast region of islands, including Australia, New Zealand, Papua New Guinea, and many Pacific Island nations.\n5. Europe: A diverse region with 50+ countries, such as the UK, Germany, France, Italy, Spain, and Greece.\n6. North America: Encompassing Canada, Mexico, the United States, and several Caribbean islands.\n7. South America: Comprising countries like Brazil, Argentina, Chile, Peru, and Colombia.\n\nKeep in mind that different sources may define continents slightly differently, but these 7 are generally accepted.",
    "done": true,
    "done_reason": "stop",
  }
}

```