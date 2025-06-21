import axios, { AxiosResponse } from "axios";
import { ITwitterApiResponse } from "../types/twitter.type";

export interface TwitterClientConfig {
  apiKey?: string | undefined;
  rateLimitDelay?: number;
}

const RAPIDAPI_CONFIG = {
  baseURL: "https://twttrapi.p.rapidapi.com",
  headers: (apiKey: string) => ({
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": "twttrapi.p.rapidapi.com",
  }),
};

export class UnofficialTwitterClient {
  private apiKey?: string | undefined;
  private rateLimitDelay: number;
  private lastRequestTime: number = 0;
  private processedTweetIds: Set<string> = new Set();

  constructor(config: TwitterClientConfig) {
    this.apiKey = config.apiKey;
    this.rateLimitDelay = config.rateLimitDelay || 1000;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  async fetchTweets(handle: string): Promise<any> {
    await this.waitForRateLimit();

    try {
      console.log(`Fetching tweets for @${handle} using RapidAPI...`);
      const tweets = await this.fetchTweetsRapidAPI(handle);
      // const tweets = await this.fetchTweetsRapidAPIMock(handle);
      if (tweets) {
        console.log(
          `Successfully fetched ${tweets.length} tweets for @${handle}`
        );
        return tweets;
      }
    } catch (error) {
      console.log(
        `RapidAPI method failed for @${handle}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    console.error(`Failed to fetch tweets for @${handle}`);
    return [];
  }

  private async fetchTweetsRapidAPI(handle: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error("API key required for RapidAPI method");
    }

    const url = `${RAPIDAPI_CONFIG.baseURL}/user-tweets`;
    const params = {
      username: handle,
    };

    console.log("Making RapidAPI request:");

    const response: AxiosResponse<ITwitterApiResponse> = await axios.get(url, {
      headers: RAPIDAPI_CONFIG.headers(this.apiKey),
      params: params,
    });

    console.log("Response status:", response.status);

    const filteredInstructions =
      response.data.data.user_result.result.timeline_response.timeline.instructions.find(
        (instruction: any) => instruction.__typename === "TimelineAddEntries"
      );

    const firstEntry = filteredInstructions?.entries?.[0];
    
    if (!firstEntry) {
      console.log("No tweets found");
      return null;
    }

    const entryId = firstEntry.entryId;
    
    if (this.processedTweetIds.has(entryId)) {
      console.log(`Tweet with ID ${entryId} already processed, skipping...`);
      return null;
    }

    const tweetText = firstEntry.content?.content?.tweetResult?.result?.legacy?.full_text;
    const mediaUrls = firstEntry.content?.content?.tweetResult?.result?.legacy?.extended_entities?.media?.map(
      (media: any) => media.media_url_https
    );

    const tweetInformation = {
      tweetText: tweetText || "",
      mediaUrls: mediaUrls || [],
      entryId: entryId,
    };

    this.processedTweetIds.add(entryId);

    console.log(tweetInformation);

    return tweetInformation;
  }

  private async fetchTweetsRapidAPIMock(handle: string): Promise<any> {
    return {
      tweetText: "Also just crossed over a million unique visitors on our site:)\nKeep the signups coming http://kled.ai",
      mediaUrls: ["https://res.cloudinary.com/dcpqmirlb/image/upload/testting_xkffxf.jpg"],
      entryId: "tweet-1896409061001093120",
    };
  }
}

export function createUnofficialTwitterClient(
  options: TwitterClientConfig = {}
): UnofficialTwitterClient {
  return new UnofficialTwitterClient({
    apiKey: options.apiKey || process.env.TWITTER_API_KEY,
    rateLimitDelay: options.rateLimitDelay || 1000,
  });
}
