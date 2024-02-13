## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
input1[/"input <br> id='input-1'"/]:::input -- "partOne->outputMessageOne" --> outputOne{{"output <br> id='outputOne'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- "partTwo->outputMessageTwo" --> outputTwo{{"output <br> id='outputTwo'"}}:::output
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
	"title": "My Board Serialized",
	"description": "This is my board after serialization.",
	"url": ".",
	"edges": [
		{
			"from": "input-1",
			"to": "outputOne",
			"out": "partOne",
			"in": "outputMessageOne"
		},
		{
			"from": "input-1",
			"to": "outputTwo",
			"out": "partTwo",
			"in": "outputMessageTwo"
		}
	],
	"nodes": [
		{
			"id": "outputTwo",
			"type": "output",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"outputMessageTwo": {
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
						"partOne": {
							"type": "string",
							"title": "partOne"
						},
						"partTwo": {
							"type": "string",
							"title": "partTwo"
						}
					},
					"required": [
						"partOne",
						"partTwo"
					]
				}
			}
		},
		{
			"id": "outputOne",
			"type": "output",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"outputMessageOne": {
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