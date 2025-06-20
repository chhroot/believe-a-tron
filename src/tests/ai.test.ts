import 'dotenv/config';
import { analyzeTweetWithAI } from '../services/ai.service';

async function testAI(): Promise<void> {
  const testTweets = [
    "Just launched our new DeFi protocol! 🚀 Major partnerships coming soon!",
    "Good morning everyone, hope you have a great day!",
    "BREAKING: We've secured $10M in funding for our next phase of development!",
    "Thanks for all the support, community is everything ❤️",
    "New token burn mechanism going live tomorrow - this will be huge! 🔥"
  ];

  console.log('Testing AI analysis on sample tweets...\n');

  for (let i = 0; i < testTweets.length; i++) {
    const tweet = testTweets[i];
    if (!tweet) continue;
    
    console.log(`Tweet ${i + 1}: "${tweet}"`);
    
    try {
      const analysis = await analyzeTweetWithAI(tweet);
      console.log(`Analysis:`, analysis);
      console.log('---\n');
    } catch (error) {
      console.error(`Error analyzing tweet ${i + 1}:`, error);
      console.log('---\n');
    }
  }
}

testAI().catch(console.error); 