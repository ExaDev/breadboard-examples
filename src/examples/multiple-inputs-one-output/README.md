## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
input1[/"input <br> id='input-1'"/]:::input -- "messageOne->partOne" --> output{{"output <br> id='output'"}}:::output
inputTwo[/"input <br> id='inputTwo'"/]:::input -- "messageTwo->partTwo" --> output{{"output <br> id='output'"}}:::output
inputThree[/"input <br> id='inputThree'"/]:::input -- "messageThree->partThree" --> output{{"output <br> id='output'"}}:::output
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
			"from": "input-1",
			"to": "output",
			"out": "messageOne",
			"in": "partOne"
		},
		{
			"from": "inputTwo",
			"to": "output",
			"out": "messageTwo",
			"in": "partTwo"
		},
		{
			"from": "inputThree",
			"to": "output",
			"out": "messageThree",
			"in": "partThree"
		}
	],
	"nodes": [
		{
			"id": "output",
			"type": "output",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"partOne": {
							"type": "string"
						},
						"partTwo": {
							"type": "string"
						},
						"partThree": {
							"type": "string"
						}
					}
				}
			}
		},
		{
			"id": "input-1",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"messageOne": {
							"type": "string",
							"title": "messageOne"
						}
					},
					"required": [
						"messageOne"
					]
				}
			}
		},
		{
			"id": "inputTwo",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"messageTwo": {
							"type": "string"
						}
					}
				}
			}
		},
		{
			"id": "inputThree",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"messageThree": {
							"type": "string"
						}
					}
				}
			}
		}
	],
	"graphs": {}
}
```