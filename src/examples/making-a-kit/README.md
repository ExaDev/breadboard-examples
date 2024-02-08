## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
joiner3["joiner <br> id='joiner-3'"] -- "result->joined" --> output5{{"output <br> id='output-5'"}}:::output
splitter4["splitter <br> id='splitter-4'"] -- "result->split" --> output5{{"output <br> id='output-5'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- all --> joiner3["joiner <br> id='joiner-3'"]
input1[/"input <br> id='input-1'"/]:::input -- all --> splitter4["splitter <br> id='splitter-4'"]
classDef default stroke:#ffab40,fill:#fff2ccff,color:#000
classDef input stroke:#3c78d8,fill:#c9daf8ff,color:#000
classDef output stroke:#38761d,fill:#b6d7a8ff,color:#000
classDef passthrough stroke:#a64d79,fill:#ead1dcff,color:#000
classDef slot stroke:#a64d79,fill:#ead1dcff,color:#000
classDef config stroke:#a64d79,fill:#ead1dcff,color:#000
classDef secrets stroke:#db4437,fill:#f4cccc,color:#000
classDef slotted stroke:#a64d79
```

## JSON
```json
{
  "edges": [
    {
      "from": "joiner-3",
      "to": "output-5",
      "out": "result",
      "in": "joined"
    },
    {
      "from": "splitter-4",
      "to": "output-5",
      "out": "result",
      "in": "split"
    },
    {
      "from": "input-1",
      "to": "joiner-3",
      "out": "*",
      "in": ""
    },
    {
      "from": "input-1",
      "to": "splitter-4",
      "out": "*",
      "in": ""
    }
  ],
  "nodes": [
    {
      "id": "output-5",
      "type": "output",
      "configuration": {
        "schema": {
          "type": "object",
          "properties": {
            "joined": {
              "type": "string",
              "title": "joined"
            },
            "split": {
              "type": "string",
              "title": "split"
            }
          },
          "required": [
            "joined",
            "split"
          ]
        }
      }
    },
    {
      "id": "joiner-3",
      "type": "joiner",
      "configuration": {}
    },
    {
      "id": "splitter-4",
      "type": "splitter",
      "configuration": {}
    },
    {
      "id": "input-1",
      "type": "input",
      "configuration": {}
    }
  ],
  "graphs": {}
}
```