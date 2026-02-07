import TelegramBot from 'node-telegram-bot-api';

// Configuration (Use Environment Variables for security)
const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '';

const bot = token ? new TelegramBot(token, { polling: false }) : null;

export async function sendTelegramMessage(message: string) {
    if (!bot) {
        console.warn("Telegram bot token not configured. Skipping message.");
        return;
    }
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log("Telegram message sent successfully.");
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
}
