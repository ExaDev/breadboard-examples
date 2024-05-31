This board currently wont work until core kit fetch gets fixed. 

This board will perform image classifcation on an image using the Hugging Face API.

This API endpoint expects a raw binary file: https://huggingface.co/docs/api-inference/detailed_parameters?code=js#image-classification-task

Because core kit stringifies the request body, this wont work inside of the board. However it can still be run on CLI as it demonstrates the expected board functionality using built in fetch function.