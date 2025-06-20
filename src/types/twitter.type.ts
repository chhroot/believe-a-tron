interface Tweet {
  extended_entities?: {
    media: {
      media_url_https: string;
    }[];
  };
  full_text: string;
}

interface Instruction {
  __typename: string;
  entries?: Array<{
    content: { content: { tweetResult: { result: { legacy: Tweet } } } };
    entryId: string;
  }>;
}

export interface ITwitterApiResponse {
  data: {
    user_result: {
      result: {
        timeline_response: {
          timeline: {
            instructions: Instruction[];
          };
        };
      };
    };
  };
}

export interface TweetData {
  text: string;
  mediaUrls?: string[];
  entryId?: string;
}
