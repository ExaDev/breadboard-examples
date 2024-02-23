## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
splitter4["splitter <br> id='splitter-4'"] -- "result->splitResult" --> output5{{"output <br> id='output-5'"}}:::output
repeater3["repeater <br> id='repeater-3'"] -- all --> splitter4["splitter <br> id='splitter-4'"]
input1[/"input <br> id='input-1'"/]:::input -- all --> repeater3["repeater <br> id='repeater-3'"]
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
			"from": "splitter-4",
			"to": "output-5",
			"out": "result",
			"in": "splitResult"
		},
		{
			"from": "repeater-3",
			"to": "splitter-4",
			"out": "*",
			"in": ""
		},
		{
			"from": "input-1",
			"to": "repeater-3",
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
						"splitResult": {
							"type": "string",
							"title": "splitResult"
						}
					},
					"required": [
						"splitResult"
					]
				}
			}
		},
		{
			"id": "splitter-4",
			"type": "splitter",
			"configuration": {}
		},
		{
			"id": "repeater-3",
			"type": "repeater",
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