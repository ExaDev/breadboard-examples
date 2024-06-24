## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
input0[/"input <br> id='input-0'"/]:::input -- "inputMessage->message" --> myPassthrough0["myPassthrough <br> id='myPassthrough-0'"]
myPassthrough0["myPassthrough <br> id='myPassthrough-0'"] -- "pOut->message" --> output0{{"output <br> id='output-0'"}}:::output
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
			"from": "input-0",
			"to": "myPassthrough-0",
			"out": "inputMessage",
			"in": "message"
		},
		{
			"from": "myPassthrough-0",
			"to": "output-0",
			"out": "pOut",
			"in": "message"
		}
	],
	"nodes": [
		{
			"id": "input-0",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"inputMessage": {
							"type": "string"
						}
					},
					"required": [
						"inputMessage"
					]
				}
			}
		},
		{
			"id": "output-0",
			"type": "output",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"message": {
							"type": "string"
						}
					},
					"required": [
						"message"
					]
				}
			}
		},
		{
			"id": "myPassthrough-0",
			"type": "myPassthrough",
			"configuration": {}
		}
	]
}
```