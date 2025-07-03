import 'dotenv/config';
import { createOfficialXClient, OfficialXClient } from '../services/x.service';

async function testXService(): Promise<void> {
  console.log('Testing Official X API v2 Service...\n');

  // Create X client
  const xClient: OfficialXClient = createOfficialXClient();

  try {
    // Test authentication
    console.log('1. Testing authentication...');
    const isAuthenticated = await xClient.testConnection();
    
    if (!isAuthenticated) {
      console.error('❌ Authentication failed. Please check your X API credentials in .env file.');
      console.log('\nRequired environment variables:');
      console.log('- X_API_KEY (Consumer Key)');
      console.log('- X_API_SECRET (Consumer Secret)');
      console.log('- X_ACCESS_TOKEN (Access Token)');
      console.log('- X_ACCESS_SECRET (Access Token Secret)');
      return;
    }

    console.log('✅ Authentication successful!\n');

    // Test fetching tweets from a test handle
    const testHandles = ['elonmusk', 'X', 'sundarpichai']; // Popular accounts for testing
    
    console.log('2. Testing tweet fetching...');
    
    for (const handle of testHandles) {
      console.log(`\n--- Testing @${handle} ---`);
      
      try {
        const tweet = await xClient.fetchTweets(handle);
        
        if (tweet) {
          console.log('✅ Successfully fetched tweet:');
          console.log(`   Tweet ID: ${tweet.tweetId}`);
          console.log(`   Entry ID: ${tweet.entryId}`);
          console.log(`   Created At: ${tweet.createdAt}`);
          console.log(`   Author ID: ${tweet.authorId}`);
          console.log(`   Text: ${tweet.tweetText.substring(0, 150)}${tweet.tweetText.length > 150 ? '...' : ''}`);
          console.log(`   Media URLs: ${tweet.mediaUrls.length} attached`);
          
          if (tweet.mediaUrls.length > 0) {
            tweet.mediaUrls.forEach((url, index) => {
              console.log(`     Media ${index + 1}: ${url}`);
            });
          }
          
          // Test duplicate detection
          console.log('\n   Testing duplicate detection...');
          const duplicateTest = await xClient.fetchTweets(handle);
          if (duplicateTest === null) {
            console.log('   ✅ Duplicate detection working correctly');
          } else {
            console.log('   ⚠️ Duplicate detection may not be working');
          }
          
        } else {
          console.log('❌ No tweets found or error occurred');
        }
        
      } catch (error) {
        console.error(`❌ Error testing @${handle}:`, error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Wait a bit between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n🏁 X Service test completed!');
}

// Run the test
testXService().catch(console.error); 