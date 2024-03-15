## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
pipe3["pipe <br> id='pipe-3'"] -- "output->output" --> output2{{"output <br> id='output-2'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- "message->message" --> pipe3["pipe <br> id='pipe-3'"]
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
	"title": "Xenova Code Node-Kit Board",
	"description": "Board which performs sentiment analysis using xenova LLM",
	"url": ".",
	"edges": [
		{
			"from": "pipe-3",
			"to": "output-2",
			"out": "output",
			"in": "output"
		},
		{
			"from": "input-1",
			"to": "pipe-3",
			"out": "message",
			"in": "message"
		}
	],
	"nodes": [
		{
			"id": "output-2",
			"type": "output",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"output": {
							"type": "string",
							"title": "output"
						}
					}
				}
			}
		},
		{
			"id": "pipe-3",
			"type": "pipe",
			"configuration": {}
		},
		{
			"id": "input-1",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"message": {
							"type": "string",
							"title": "message"
						}
					},
					"required": [
						"message"
					]
				}
			}
		}
	],
	"graphs": {}
}
```