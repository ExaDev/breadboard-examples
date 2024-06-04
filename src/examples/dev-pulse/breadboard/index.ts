import { board, Schema, base, addKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import { config } from "dotenv";
import HackerNewsFirebaseKit from "../kits/hackerNews/HackerNewsFirebaseKit.js";
import HackerNewsAlgoliaKit from "../kits/hackerNews/HackerNewsAlgoliaKit.js";
import ListKit from "../kits/ListKit.js";
import ClaudeKit from "../kits/ClaudeKit.js";
import ObjectKit from "../kits/ObjectKit.js";
import StringKit from "../kits/StringKit.js";
import JsonKit from "../kits/JsonKit.js";

const LIMIT_DEPTH = 3;
const SEARCH_RESULT_COUNT = 2;

const DEBUG = false;
const TOP_STORIES = false;

config();
//////////////////////////////////////////////
const hnFirebaseKit = addKit(HackerNewsFirebaseKit);
const algolia = addKit(HackerNewsAlgoliaKit);
const core = addKit(Core);
const listKit = addKit(ListKit);
const claudeKit = addKit(ClaudeKit);
const objectKit = addKit(ObjectKit);
const stringKit = addKit(StringKit);
const jsonKit = addKit(JsonKit);
//////////////////////////////////////////////
const query: Schema = {
	title: "Please enter a search query",
	type: "string",
};
const limit: Schema = {
	title: "Please enter the number of results to return",
	type: "number",
	default: SEARCH_RESULT_COUNT.toString(),
};
const claudeApiKeySchema: Schema = {
	title: "Please enter your API Key",
	type: "password",
};
//////////////////////////////////////////////
const searchParams: Schema = {
	type: "object",
	properties: {
		query,
		limit,
		claudeApiKey: claudeApiKeySchema,
	},
} satisfies Schema;
//////////////////////////////////////////////

const devPulseBoard = board(() => {
	const search = algolia.search({
		tags: ["story"],
		limit: SEARCH_RESULT_COUNT,
	});

	const searchInProgress = base.output({ $id: "searchInProgress" });

	const searchParamsInput = base.input({
		$id: "searchParams",
		schema: searchParams,
	});
	const searchParamPassthrough = core.passthrough();

	searchParamsInput.to(searchParamPassthrough);
	searchParamPassthrough.to(searchInProgress);

	searchParamPassthrough.query.to(search);
	searchParamPassthrough.limit.to(search);

	search.algoliaUrl.to(base.output({ $id: "algoliaSearchUrl" }));

	const claudeApiKey = core.secrets({
		keys: ["CLAUDE_API_KEY"],
	});

	//////////////////////////////////////////////
	if (DEBUG) {
		search.hits.to(base.output({ $id: "searchResults" }));
	}

	const popSearchResult = listKit.pop({
		$id: "popSearchResult",
	});

	search.hits.as("list").to(popSearchResult);
	popSearchResult.list.to(popSearchResult);
	const searchResult = objectKit.spread({
		$id: "searchResult",
	});
	popSearchResult.item.as("object").to(searchResult);
	const searchResultOutput = base.output({
		$id: "searchResultData",
	});
	searchResult.story_id.to(searchResultOutput);
	searchResult.title.to(searchResultOutput);
	searchResult.url.to(searchResultOutput);
	searchResult.author.to(searchResultOutput);
	searchResult.created_at.to(searchResultOutput);
	searchResult.created_at_i.to(searchResultOutput);
	searchResult.points.to(searchResultOutput);
	stringKit
		.template({
			template: "https://news.ycombinator.com/item?id={{story_id}}",
			story_id: searchResult.story_id,
		})
		.string.as("hnURL")
		.to(searchResultOutput);

	//////////////////////////////////////////////

	const popStory = listKit.pop({
		$id: "popStoryId",
	});
	if (TOP_STORIES) {
		const hackerNewsTopStoryIdList = core.passthrough();
		hnFirebaseKit
			.topStoryIds({
				limit: 1,
			})
			.storyIds.to(hackerNewsTopStoryIdList);
		hackerNewsTopStoryIdList.storyIds.as("list").to(popStory);
	}
	popStory.list.to(popStory);
	const storyId = core.passthrough();
	popStory.item.as("id").to(storyId);

	if (DEBUG) {
		popStory.item.as("id").to(
			base.output({
				$id: "storyId",
			})
		);
	}

	//////////////////////////////////////////////
	searchResult.story_id.as("id").to(storyId);
	//////////////////////////////////////////////

	const getStoryFromId = algolia.getStory();
	storyId.id.to(getStoryFromId);
	const story = core.passthrough();

	getStoryFromId.to(story);
	if (DEBUG) {
		getStoryFromId.to(
			base.output({
				$id: "fullStory",
			})
		);
	}

	const storyOutput = base.output({
		$id: "story",
	});

	getStoryFromId.algoliaUrl.to(storyOutput);
	getStoryFromId.author.to(storyOutput);
	getStoryFromId.created_at.to(storyOutput);
	getStoryFromId.created_at_i.to(storyOutput);
	getStoryFromId.points.to(storyOutput);
	getStoryFromId.story_id.to(storyOutput);
	getStoryFromId.title.to(storyOutput);
	getStoryFromId.type.to(storyOutput);
	getStoryFromId.url.to(storyOutput);
	search.algoliaUrl.to(storyOutput);

	if (DEBUG) {
		getStoryFromId.children.to(storyOutput);
	}

	//////////////////////////////////////////////

	const serverUrl = "https://api.anthropic.com/v1/complete";

	/* const VITE_SERVER_PORT = 5173;
	const fallback = `http://localhost:${VITE_SERVER_PORT}`;
	let serverUrl = `${fallback}/anthropic/v1/complete`;

	if (typeof process !== "undefined" && process.release.name === "node") {
		console.log("Running in node");
		serverUrl = `${fallback}/anthropic/v1/complete`;
	} */

	//////////////////////////////////////////////

	const stringifiedPost = jsonKit.stringify();

	const nest = objectKit.nest({
		key: "story",
	});

	story.to(nest);

	if (LIMIT_DEPTH) {
		const limit = objectKit.limitDepth({
			depth: LIMIT_DEPTH,
		});
		nest.story.as("object").to(limit);
		limit.object.to(stringifiedPost);
	} else {
		getStoryFromId.story.as("object").to(stringifiedPost);
	}
	if (DEBUG) {
		stringifiedPost.string.to(base.output({ $id: "json" }));
	}

	//////////////////////////////////////////////

	const instruction = "Summarise the discussion regarding this post";
	const templateText = [instruction, "```json", "{{story}}", "```"].join("\n");

	story.story_id.to(
		base.output({
			$id: "templateText",
			instruction,
			templateText,
		})
	);

	const instructionTemplate = stringKit.template({
		$id: "instructionTemplate",
		template: templateText,
		story: stringifiedPost.string,
	});

	if (DEBUG) {
		instructionTemplate.string.to(
			base.output({
				$id: "populatedTemplate",
			})
		);
	}

	const pendingSummary = base.output({
		$id: "pendingOutput",
		summary: "pending",
	});
	story.story_id.to(pendingSummary);

	const claudeParams = {
		model: "claude-2",
		url: `${serverUrl}`,
		apiKey: claudeApiKey.CLAUDE_API_KEY,
	};
	const claudePostSummarisation = claudeKit.complete({
		$id: "claudePostSummarisation",
		...claudeParams,
	});

	// claudeApiKey.CLAUDE_API_KEY.as("apiKey").to(claudePostSummarisation);
	instructionTemplate.string.as("userQuestion").to(claudePostSummarisation);

	const summaryOutput = base.output({
		$id: "summary",
	});
	story.story_id.to(summaryOutput);

	claudePostSummarisation.completion.to(summaryOutput);

	return summaryOutput;
});

const serializedDevPulseBoard = devPulseBoard.serialize({
	title: "DevPulse",
	description: "The description of DevPulse.",
});

export default await serializedDevPulseBoard;
