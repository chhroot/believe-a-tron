import 'dotenv/config';
import BelieveCryptoBot from './bot';

async function main(): Promise<void> {
  console.log('🚀 Starting Believe-a-tron 9000...');
  console.log('This bot will run 24/7 monitoring X accounts for crypto opportunities');
  
  const bot = new BelieveCryptoBot();
  
  await bot.start();
  
  process.on('SIGINT', () => {
    console.log('\n⏹️  Received SIGINT, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⏹️  Received SIGTERM, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });
  
  console.log('✅ Bot is now running! Press Ctrl+C to stop.');
}

main().catch((error) => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
}); 