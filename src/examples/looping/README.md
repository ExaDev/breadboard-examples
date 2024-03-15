## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
pop["invoke <br> id='pop'"] -- "list->list" --> pop["invoke <br> id='pop'"]
pop["invoke <br> id='pop'"] -- "item->item" --> output2{{"output <br> id='output-2'"}}:::output
pop["invoke <br> id='pop'"] -- "list->remaining" --> output2{{"output <br> id='output-2'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- "list->list" --> pop["invoke <br> id='pop'"]

subgraph sg_pop [pop]
pop_popinput[/"input <br> id='pop-input'"/]:::input -- all --> pop_poprun["runJavascript <br> id='pop-run'"]
pop_poprun["runJavascript <br> id='pop-run'"] -- all --> pop_popoutput{{"output <br> id='pop-output'"}}:::output
end

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
			"from": "pop",
			"to": "pop",
			"out": "list",
			"in": "list"
		},
		{
			"from": "pop",
			"to": "output-2",
			"out": "item",
			"in": "item"
		},
		{
			"from": "pop",
			"to": "output-2",
			"out": "list",
			"in": "remaining"
		},
		{
			"from": "input-1",
			"to": "pop",
			"out": "list",
			"in": "list"
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
						"item": {
							"type": "string",
							"title": "item"
						},
						"remaining": {
							"type": "string",
							"title": "remaining"
						}
					}
				}
			}
		},
		{
			"id": "pop",
			"type": "invoke",
			"configuration": {
				"$board": "#pop"
			}
		},
		{
			"id": "input-1",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"list": {
							"type": "string",
							"title": "list"
						}
					},
					"required": [
						"list"
					]
				}
			}
		}
	],
	"graphs": {
		"pop": {
			"edges": [
				{
					"from": "pop-input",
					"to": "pop-run",
					"out": "*"
				},
				{
					"from": "pop-run",
					"to": "pop-output",
					"out": "*"
				}
			],
			"nodes": [
				{
					"id": "pop-input",
					"type": "input",
					"configuration": {}
				},
				{
					"id": "pop-run",
					"type": "runJavascript",
					"configuration": {
						"code": "function pop(inputs) {\n        if (inputs.list && Array.isArray(inputs.list) && inputs.list.length > 0) {\n            // return {};\n            const list = inputs.list;\n            const item = list.pop();\n            return { item, list };\n        }\n        return {};\n    }",
						"name": "pop",
						"raw": true
					}
				},
				{
					"id": "pop-output",
					"type": "output",
					"configuration": {}
				}
			]
		}
	}
}
```