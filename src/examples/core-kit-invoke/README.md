### Core Kit Invoke

The core kit `invoke` function allows us to call boards within another board. This is a powerful tool as it allows us to chain multiple boards together to create entire pipelines of logic.

## Example

In this example we are calling the `hello-world` board inside our wrapper board. The wrapper board will then concatenate the output from the `hello-world` board with an input from the wrapper board and return the concacatenated string.

## Use Cases

Chaining boards together is a powerful tool as we could use multiple LMM pipelines together. For example we could have a board which calls an API to get some data, in this case let's say this API fetches articles from a website. A wrapper board could then take these articles and perform summarization, another wrapper board could then take this summarization and perform sentiment analysis. The possibilities are endless. This allows us to build boards independently of each other and build large pipelines of logic.

for more complicated examples see the following boards:

[Hacker News Algolia Simplified Search](https://github.com/ExaDev/breadboard/blob/develop/packages/breadboard-web/src/boards/hacker-news-simplified-algolia-search.ts)
[Hacker News Algolia Simplified Story Search](https://github.com/ExaDev/breadboard/blob/develop/packages/breadboard-web/src/boards/hacker-news-simplified-algolia-story-search.ts)
[Hacker News Algolia Simplified Comment Search](https://github.com/ExaDev/breadboard/blob/develop/packages/breadboard-web/src/boards/hacker-news-simplified-algolia-search.ts)
