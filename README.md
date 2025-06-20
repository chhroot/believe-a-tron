# Believe Crypto Bot 🚀

A 24/7 automated bot that monitors X (Twitter) accounts of crypto project founders, analyzes their posts with AI, and automatically executes token purchases based on intelligent decision-making.

## Features

- **24/7 Monitoring**: Continuously monitors specified X accounts every 5 seconds
- **AI Analysis**: Uses Google's Gemini AI to analyze posts in JSON mode for buying opportunities
- **Automated Trading**: Executes token purchases via Jupiter/DEX swaps on Solana
- **Telegram Notifications**: Sends detailed decisions and trade results to your Telegram chat
- **Duplicate Prevention**: Tracks processed tweets to avoid duplicate analysis
- **Error Handling**: Robust error handling with notifications
- **Optional Dashboard**: Web interface for monitoring and control

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd believe-crypto-bot

# Install dependencies
npm install

# Copy environment template
cp env.example .env
```

### 2. Configuration

Edit your `.env` file with the required API keys:

```env
# Twitter API Credentials
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_METHOD=rapidapi

# AI API Credentials (e.g., Google Gemini or OpenAI)
AI_API_KEY=your_ai_api_key_here

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Solana Wallet for Token Purchases
SOLANA_WALLET_PRIVATE_KEY=your_solana_wallet_private_key_here
SOLANA_WALLET_PUBLIC_KEY=your_solana_wallet_public_key_here
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_solana_private_key_here
```

### 3. Setup Telegram

```bash
# Get your Telegram chat ID
npm run setup-telegram
```

### 4. Test AI Analysis

```bash
# Test the AI analysis functionality
npm run test-ai
```

### 5. Run the Bot

```bash
# Start the bot (runs 24/7)
npm start

# Or run in development mode with auto-restart
npm run dev
```

## API Keys Setup

### Twitter API
1. Go to [RapidAPI twttrapi](https://rapidapi.com/Glavier/api/twttrapi)
2. Subscribe to a plan
3. Copy your API key to `TWITTER_API_KEY`
4. Set `TWITTER_METHOD=rapidapi`

### AI API
1. Go to [Google AI Studio](https://aistudio.google.com/) for Gemini
2. Or use OpenAI API for GPT models
3. Create an API key
4. Copy to `AI_API_KEY`

### Telegram Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the token to `TELEGRAM_BOT_TOKEN`
4. Run `npm run setup-telegram` to get your chat ID

## Usage

### Main Bot
```bash
npm start          # Start the bot
npm run dev        # Development mode with auto-restart
```

### Optional Dashboard
```bash
npm run dashboard  # Start web dashboard on http://localhost:3000
```

### Testing
```bash
npm run test-ai    # Test AI analysis
npm run setup-telegram  # Get Telegram chat ID
```

## How It Works

1. **Monitoring**: Bot checks specified X accounts every 5 seconds for new posts
2. **AI Analysis**: Each new post is analyzed by Google's Gemini AI to determine if it indicates a buying opportunity
3. **Decision Making**: AI considers factors like:
   - Major announcements or partnerships
   - Development progress updates
   - Market sentiment indicators
   - Spam/casual conversation filtering
4. **Trading**: If AI determines it's worth buying, the bot attempts to purchase the associated token
5. **Notifications**: All decisions and trade results are sent to your Telegram chat
