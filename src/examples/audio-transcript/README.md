This board currently wont work until core kit fetch gets fixed. 

This board will produce an audio transcript of the provided audio file.

This API endpoint expects a raw binary file: https://huggingface.co/docs/api-inference/detailed_parameters?code=js#automatic-speech-recognition-task

Because the core kit stringifies the request body, this wont work inside of the board. However it can still be run on CLI as it demonstrates the expected board functionality using built in fetch function.