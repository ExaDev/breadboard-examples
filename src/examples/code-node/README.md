## Mermaid
```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
fn3["invoke <br> id='fn-3'"] -- "uppercase->uppercase" --> output2{{"output <br> id='output-2'"}}:::output
fn4["invoke <br> id='fn-4'"] -- "concatenated->text" --> fn5["invoke <br> id='fn-5'"]
fn4["invoke <br> id='fn-4'"] -- "concatenated->concatenated" --> output2{{"output <br> id='output-2'"}}:::output
fn5["invoke <br> id='fn-5'"] -- "reversed->reversed" --> output2{{"output <br> id='output-2'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- "greet->input" --> fn3["invoke <br> id='fn-3'"]
input1[/"input <br> id='input-1'"/]:::input -- "greet->base" --> fn4["invoke <br> id='fn-4'"]
input1[/"input <br> id='input-1'"/]:::input -- "subject->toConcat" --> fn4["invoke <br> id='fn-4'"]

subgraph sg_fn3 [fn-3]
fn3_fn3input[/"input <br> id='fn-3-input'"/]:::input -- all --> fn3_fn3run["runJavascript <br> id='fn-3-run'"]
fn3_fn3run["runJavascript <br> id='fn-3-run'"] -- all --> fn3_fn3output{{"output <br> id='fn-3-output'"}}:::output
end


subgraph sg_fn4 [fn-4]
fn4_fn4input[/"input <br> id='fn-4-input'"/]:::input -- all --> fn4_fn4run["runJavascript <br> id='fn-4-run'"]
fn4_fn4run["runJavascript <br> id='fn-4-run'"] -- all --> fn4_fn4output{{"output <br> id='fn-4-output'"}}:::output
end


subgraph sg_fn5 [fn-5]
fn5_fn5input[/"input <br> id='fn-5-input'"/]:::input -- all --> fn5_fn5run["runJavascript <br> id='fn-5-run'"]
fn5_fn5run["runJavascript <br> id='fn-5-run'"] -- all --> fn5_fn5output{{"output <br> id='fn-5-output'"}}:::output
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
			"from": "fn-3",
			"to": "output-2",
			"out": "uppercase",
			"in": "uppercase"
		},
		{
			"from": "fn-4",
			"to": "fn-5",
			"out": "concatenated",
			"in": "text"
		},
		{
			"from": "fn-4",
			"to": "output-2",
			"out": "concatenated",
			"in": "concatenated"
		},
		{
			"from": "fn-5",
			"to": "output-2",
			"out": "reversed",
			"in": "reversed"
		},
		{
			"from": "input-1",
			"to": "fn-3",
			"out": "greet",
			"in": "input"
		},
		{
			"from": "input-1",
			"to": "fn-4",
			"out": "greet",
			"in": "base"
		},
		{
			"from": "input-1",
			"to": "fn-4",
			"out": "subject",
			"in": "toConcat"
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
						"concatenated": {
							"type": "string",
							"title": "concatenated"
						},
						"reversed": {
							"type": "string",
							"title": "reversed"
						},
						"uppercase": {
							"type": "string",
							"title": "uppercase"
						}
					},
					"required": [
						"concatenated",
						"reversed",
						"uppercase"
					]
				}
			}
		},
		{
			"id": "fn-3",
			"type": "invoke",
			"configuration": {
				"path": "#fn-3"
			}
		},
		{
			"id": "fn-4",
			"type": "invoke",
			"configuration": {
				"path": "#fn-4"
			}
		},
		{
			"id": "fn-5",
			"type": "invoke",
			"configuration": {
				"path": "#fn-5"
			}
		},
		{
			"id": "input-1",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"greet": {
							"type": "string",
							"title": "greet"
						},
						"subject": {
							"type": "string",
							"title": "subject"
						}
					},
					"required": [
						"greet",
						"subject"
					]
				}
			}
		}
	],
	"graphs": {
		"fn-3": {
			"edges": [
				{
					"from": "fn-3-input",
					"to": "fn-3-run",
					"out": "*"
				},
				{
					"from": "fn-3-run",
					"to": "fn-3-output",
					"out": "*"
				}
			],
			"nodes": [
				{
					"id": "fn-3-input",
					"type": "input",
					"configuration": {}
				},
				{
					"id": "fn-3-run",
					"type": "runJavascript",
					"configuration": {
						"code": "function fn_3({input}) {const uppercase=input.toUpperCase();return{uppercase}}",
						"name": "fn_3",
						"raw": true
					}
				},
				{
					"id": "fn-3-output",
					"type": "output",
					"configuration": {}
				}
			]
		},
		"fn-4": {
			"edges": [
				{
					"from": "fn-4-input",
					"to": "fn-4-run",
					"out": "*"
				},
				{
					"from": "fn-4-run",
					"to": "fn-4-output",
					"out": "*"
				}
			],
			"nodes": [
				{
					"id": "fn-4-input",
					"type": "input",
					"configuration": {}
				},
				{
					"id": "fn-4-run",
					"type": "runJavascript",
					"configuration": {
						"code": "function fn_4({base,toConcat}) {const concatenated=base.concat(toConcat);return{concatenated}}",
						"name": "fn_4",
						"raw": true
					}
				},
				{
					"id": "fn-4-output",
					"type": "output",
					"configuration": {}
				}
			]
		},
		"fn-5": {
			"edges": [
				{
					"from": "fn-5-input",
					"to": "fn-5-run",
					"out": "*"
				},
				{
					"from": "fn-5-run",
					"to": "fn-5-output",
					"out": "*"
				}
			],
			"nodes": [
				{
					"id": "fn-5-input",
					"type": "input",
					"configuration": {}
				},
				{
					"id": "fn-5-run",
					"type": "runJavascript",
					"configuration": {
						"code": "function fn_5({text}) {const reversed2=text.split(\"\").reverse().join(\"\");return{reversed:reversed2}}",
						"name": "fn_5",
						"raw": true
					}
				},
				{
					"id": "fn-5-output",
					"type": "output",
					"configuration": {}
				}
			]
		}
	}
}
```