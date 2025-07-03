import { TwitterApi, TweetV2 } from 'twitter-api-v2';

export interface XClientConfig {
  appKey?: string | undefined;
  appSecret?: string | undefined;
  accessToken?: string | undefined;
  accessSecret?: string | undefined;
}

export interface XTweetData {
  tweetText: string;
  mediaUrls: string[];
  entryId: string;
  tweetId: string;
  createdAt?: string | undefined;
  authorId?: string | undefined;
}

export class OfficialXClient {
  private client: TwitterApi;
  private processedTweetIds: Set<string> = new Set();

  constructor(config: XClientConfig) {
    // Initialize Twitter API client with OAuth 1.0a credentials
    this.client = new TwitterApi({
      appKey: config.appKey || process.env.X_API_KEY || '',
      appSecret: config.appSecret || process.env.X_API_SECRET || '',
      accessToken: config.accessToken || process.env.X_ACCESS_TOKEN || '',
      accessSecret: config.accessSecret || process.env.X_ACCESS_SECRET || '',
    });

    console.log('✅ X API client initialized');
  }

  /**
   * Get user ID from username
   * Uses GET /2/users/by/username/{username} endpoint
   */
  async getUserId(username: string): Promise<string | null> {
    try {
      console.log(`🔍 Getting user ID for @${username}...`);
      
      const user = await this.client.v2.userByUsername(username);
      
      if (user.data?.id) {
        console.log(`✅ Found user ID: ${user.data.id} for @${username}`);
        console.log(`   Name: ${user.data.name}`);
        console.log(`   Username: ${user.data.username}`);
        return user.data.id;
      }
      
      console.log(`❌ User @${username} not found`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting user ID for @${username}:`, error);
      return null;
    }
  }

  /**
   * Get user timeline and return the latest tweet
   * Uses GET /2/users/{id}/tweets endpoint
   */
  async getUserTimeline(userId: string, username: string): Promise<XTweetData | null> {
    try {
      console.log(`📡 Fetching timeline for user ID: ${userId} (@${username})...`);
      
      // Fetch user tweets with media expansions
      const timeline = await this.client.v2.userTimeline(userId, {
        max_results: 5, // Get recent tweets
        'tweet.fields': ['created_at', 'author_id', 'attachments', 'entities'],
        'media.fields': ['url', 'preview_image_url', 'type'],
        expansions: ['attachments.media_keys']
      });

      if (!timeline.data?.data || timeline.data.data.length === 0) {
        console.log(`❌ No tweets found for @${username}`);
        return null;
      }

      // Get the most recent tweet
      const latestTweet = timeline.data.data[0];
      
      if (!latestTweet) {
        console.log(`❌ No latest tweet found for @${username}`);
        return null;
      }

      // Check if we've already processed this tweet
      if (this.processedTweetIds.has(latestTweet.id)) {
        console.log(`⏭️ Tweet ${latestTweet.id} already processed, skipping...`);
        return null;
      }

      // Extract media URLs if present
      const mediaUrls: string[] = [];
      if (latestTweet.attachments?.media_keys && timeline.includes?.media) {
        for (const mediaKey of latestTweet.attachments.media_keys) {
          const media = timeline.includes.media.find(m => m.media_key === mediaKey);
          if (media && media.url) {
            mediaUrls.push(media.url);
          } else if (media && media.preview_image_url) {
            mediaUrls.push(media.preview_image_url);
          }
        }
      }

      const tweetData: XTweetData = {
        tweetText: latestTweet.text || "",
        mediaUrls: mediaUrls,
        entryId: `tweet-${latestTweet.id}`,
        tweetId: latestTweet.id,
        createdAt: latestTweet.created_at,
        authorId: latestTweet.author_id
      };

      // Mark as processed
      this.processedTweetIds.add(latestTweet.id);

      console.log(`✅ Successfully fetched tweet for @${username}:`);
      console.log(`   Tweet ID: ${tweetData.tweetId}`);
      console.log(`   Text: ${tweetData.tweetText.substring(0, 100)}${tweetData.tweetText.length > 100 ? '...' : ''}`);
      console.log(`   Media URLs: ${tweetData.mediaUrls.length}`);
      console.log(`   Created At: ${tweetData.createdAt}`);

      return tweetData;

    } catch (error) {
      console.error(`❌ Error fetching timeline for @${username}:`, error);
      return null;
    }
  }


  async fetchTweets(username: string): Promise<XTweetData | null> {
    try {
      const userId = await this.getUserId(username);
      if (!userId) {
        return null;
      }

      const tweet = await this.getUserTimeline(userId, username);
      return tweet;

    } catch (error) {
      console.error(`❌ Error fetching tweets for @${username}:`, error);
      return null;
    }
  }


  getClient(): TwitterApi {
    return this.client;
  }
}

export function createOfficialXClient(
  options: XClientConfig = {}
): OfficialXClient {
  return new OfficialXClient({
    appKey: options.appKey || process.env.X_API_KEY,
    appSecret: options.appSecret || process.env.X_API_SECRET,
    accessToken: options.accessToken || process.env.X_ACCESS_TOKEN,
    accessSecret: options.accessSecret || process.env.X_ACCESS_SECRET,
  });
}
