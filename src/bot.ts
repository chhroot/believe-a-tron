import "dotenv/config";
import {
  createUnofficialTwitterClient,
  UnofficialTwitterClient,
} from "./services/twitter.service";
import {
  createTelegramBot,
  sendTelegramNotification,
} from "./services/telegram.service";
import { analyzeTweetWithAI } from "./services/ai.service";
import TelegramBot from "node-telegram-bot-api";
import {
  getHandles,
  getTokenDataForHandle,
  getHandleTokenMappings,
} from "./utils/tokens.js";
import { HandleTokenMapping } from "./types/tokens.type.js";
import { JupiterQuoteParams } from "./types/jupiter.type";
import { JupiterService } from "./services/jupiter.service";
import { SolanaService } from "./services/solana.service";
import { TweetData } from "./types/twitter.type";
import { AIAnalysis } from "./types/ai.type";
import { BotStats, BotStatus } from "./types/bot.type";

export default class BelieveCryptoBot {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private stats: BotStats = {
    tweetsProcessed: 0,
    tokensAnalyzed: 0,
    purchasesMade: 0,
    lastRun: null,
    errors: 0,
    uptime: 0,
  };

  private startTime: Date = new Date();
  private TARGET_USD_AMOUNT: number = 1;

  private twitterClient: UnofficialTwitterClient;
  private telegramBot: TelegramBot;
  private chatId: string;
  private xHandles: string[];
  private handleTokenMappings: HandleTokenMapping[];

  constructor() {
    this.twitterClient = createUnofficialTwitterClient({
      apiKey: process.env.TWITTER_API_KEY,
    });

    this.telegramBot = createTelegramBot(process.env.TELEGRAM_BOT_TOKEN || "");
    this.chatId = process.env.TELEGRAM_CHAT_ID || "";

    this.handleTokenMappings = getHandleTokenMappings();
    this.xHandles = getHandles();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("Bot is already running");
      return;
    }

    this.isRunning = true;
    console.log("Bot started. Monitoring handles:", this.xHandles);
    console.log("Token mappings loaded:");
    this.handleTokenMappings.forEach((mapping) => {
      console.log(
        `  @${mapping.handle} -> ${mapping.tokenData.symbol} (${mapping.tokenData.address})`
      );
    });

    this.intervalId = setInterval(() => this.monitorTweets(), 5000);
    this.monitorTweets();
  }

  stop(): void {
    if (!this.isRunning) {
      console.log("Bot is not running");
      return;
    }

    this.isRunning = false;
    this.isPaused = false; // Reset pause state when stopping
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("Bot stopped");
  }

  pause(): void {
    if (!this.isRunning) {
      console.log("Cannot pause: Bot is not running");
      return;
    }

    if (this.isPaused) {
      console.log("Bot is already paused");
      return;
    }

    this.isPaused = true;
    console.log("⏸️ Bot paused - monitoring suspended");
  }

  resume(): void {
    if (!this.isRunning) {
      console.log("Cannot resume: Bot is not running");
      return;
    }

    if (!this.isPaused) {
      console.log("Bot is not paused");
      return;
    }

    this.isPaused = false;
    console.log("▶️ Bot resumed - monitoring active");
  }

  private async monitorTweets(): Promise<void> {
    try {
      if (this.isPaused) {
        console.log(`⏸️ Bot is paused, skipping monitoring cycle...`);
        return;
      }

      this.stats.lastRun = new Date();
      this.stats.uptime = Math.floor(
        (Date.now() - this.startTime.getTime()) / 1000
      );

      console.log(`🔍 Monitoring ${this.xHandles.length} handles...`);

      for (const handle of this.xHandles) {
        if (this.isPaused) {
          console.log(`⏸️ Bot paused during monitoring, stopping current cycle...`);
          break;
        }

        const tweet = await this.twitterClient.fetchTweets(handle.trim());

        if (tweet && !Array.isArray(tweet)) {
          await this.processTweetWithAI(handle, tweet);
        }
      }
    } catch (error) {
      console.error("❌ Error in monitorTweets:", error);
      this.stats.errors++;
    }
  }

  private async processTweetWithAI(handle: string, tweet: any): Promise<any> {
    try {
      const tweetData: TweetData = {
        text: tweet.tweetText || "",
        mediaUrls: tweet.mediaUrls || [],
      };

      console.log(`🤖 Analyzing tweet from @${handle}:`);
      console.log(
        `📝 Text: ${tweetData.text.substring(0, 100)}${
          tweetData.text.length > 100 ? "..." : ""
        }`
      );
      console.log(`🖼️ Media: ${tweetData.mediaUrls?.length || 0} image(s)`);
      if (tweetData.mediaUrls && tweetData.mediaUrls.length > 0) {
        tweetData.mediaUrls.forEach((url, index) => {
          console.log(`   Image ${index + 1}: ${url}`);
        });
      }

      const analysis: AIAnalysis = await analyzeTweetWithAI(tweetData);

      console.log(`🎯 AI Analysis Result:`);
      console.log(
        `   Worth Buying: ${analysis.is_worth_buying ? "✅ YES" : "❌ NO"}`
      );
      console.log(
        `   Confidence: ${Math.round(analysis.confidence_score * 100)}%`
      );
      console.log(`   Reason: ${analysis.reason}`);

      const tweetId = tweet.entryId.replace("tweet-", "");
      const tweetUrl = `https://x.com/${handle}/status/${tweetId}`;
      const decision = analysis.is_worth_buying
        ? "✅ WORTH BUYING"
        : "❌ NOT WORTH BUYING";
      const confidence = `${Math.round(analysis.confidence_score * 100)}%`;

      const message = `🚨 NEW POST DETECTED
      
👤 **${handle}** posted

🔗 ${tweetUrl}

🤖 **AI Decision:** ${decision}
📊 **Confidence:** ${confidence}
💭 **Reason:** ${analysis.reason}

${
  analysis.is_worth_buying
    ? "🚀 Initiating token purchase..."
    : "⏭️ Skipping this opportunity"
}`;

      if (analysis.is_worth_buying) {
        await sendTelegramNotification(this.telegramBot, this.chatId, message);
        await this.attemptTokenPurchase(handle, tweet);
        this.stats.tweetsProcessed++;
      } else {
        await sendTelegramNotification(this.telegramBot, this.chatId, message);
        this.stats.tweetsProcessed++;
      }

      return analysis;
    } catch (error) {
      console.error(`❌ Error processing tweet with AI for @${handle}:`, error);
      throw error;
    }
  }

  private async attemptTokenPurchase(
    handle: string,
    analysis: AIAnalysis
  ): Promise<void> {
    try {
      console.log(`💰 Attempting to buy token related to @${handle}...`);

      const tokenData = getTokenDataForHandle(handle);

      if (!tokenData) {
        console.log(`⚠️ No token data found for handle @${handle}`);
        const noTokenMessage = `⚠️ NO TOKEN DATA
        
      👤 **Handle:** @${handle}
      ❌ **Error:** No token configuration found in tokens.json
      💡 **Action:** Add token data to tokens.json file`;

        await sendTelegramNotification(
          this.telegramBot,
          this.chatId,
          noTokenMessage
        );
        return;
      }

      console.log(
        `📊 Token data found - Symbol: ${tokenData.symbol}, Address: ${tokenData.address}`
      );

      const solanaService = SolanaService.createFromEnv();
      const balance = await solanaService.getBalance();

      console.log(`💲 Fetching current SOL price...`);
      const solPriceUSD = await JupiterService.getSolPriceInUSD();
      const targetUSDAmount = this.TARGET_USD_AMOUNT;
      const solAmountForTarget = targetUSDAmount / solPriceUSD;
      
      console.log(`💰 Target Amount: $${targetUSDAmount}`);

      const requiredBalance = solAmountForTarget * 1.1;
      if (balance < requiredBalance) {
        const insufficientBalanceMessage = `❌ Insufficient SOL balance`;
        
        await sendTelegramNotification(
          this.telegramBot,
          this.chatId,
          insufficientBalanceMessage
        );
        return;
      }

      const SOL_MINT = "So11111111111111111111111111111111111111112";
      // Convert SOL amount to lamports (1 SOL = 1,000,000,000 lamports)
      const AMOUNT_SOL_LAMPORTS = Math.floor(solAmountForTarget * 1e9).toString();

      const quoteParams: JupiterQuoteParams = {
        inputMint: SOL_MINT,
        outputMint: tokenData.address,
        amount: AMOUNT_SOL_LAMPORTS,
        slippageBps: 100,
        restrictIntermediateTokens: true,
      };

      try {
        const result = await JupiterService.executeSwap(
          quoteParams,
          solanaService,
          {
            dynamicComputeUnitLimit: true,
          }
        );

        const swapMessage = `${result.confirmed ? "✅" : "❌"} Swap successful!
👤 **Handle:** @${handle}
💰 **Token:** ${tokenData.symbol}
🏠 **Address:** ${tokenData.address}
💵 **Input:** ${solAmountForTarget} SOL ($${targetUSDAmount})
💎 **Output:** ${result.quote.outAmount} ${tokenData.symbol}
📊 **SOL Price:** $${solPriceUSD}`;

        await sendTelegramNotification(
          this.telegramBot,
          this.chatId,
          swapMessage
        );
      } catch (error: any) {
        const errorMessage = `${
          error ? error?.transactionMessage : "Unknown error"
        }`;
        await sendTelegramNotification(
          this.telegramBot,
          this.chatId,
          errorMessage
        );
        throw error;
      }
    } catch (error) {
      console.error(
        `❌ Error attempting token purchase for @${handle}:`,
        error
      );

      throw error;
    }
  }

  getStatus(): BotStatus {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      monitoredHandles: this.xHandles,
      stats: this.stats,
    };
  }

  updateHandles(newHandles: string[]): void {
    this.xHandles = newHandles;
    console.log("Updated monitored handles:", this.xHandles);
  }

  updateTargetUSDAmount(newAmount: number): void {
    if (newAmount <= 0) {
      throw new Error("Target USD amount must be greater than 0");
    }
    this.TARGET_USD_AMOUNT = newAmount;
    console.log(`Updated target USD amount to: $${newAmount}`);
  }

  getTargetUSDAmount(): number {
    return this.TARGET_USD_AMOUNT;
  }
}
