import TelegramBot from 'node-telegram-bot-api';

export function createTelegramBot(token: string): TelegramBot {
  return new TelegramBot(token, { polling: true });
}

export async function sendTelegramNotification(
  bot: TelegramBot, 
  chatId: string | number, 
  message: string
): Promise<void> {
  try {
    await bot.sendMessage(chatId, message);
    console.log('Telegram notification sent:', message);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
} 