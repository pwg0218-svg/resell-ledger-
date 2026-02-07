import TelegramBot from 'node-telegram-bot-api';

// Configuration (Hardcoded for immediate use, recommend .env for production)
const token = '8409217855:AAEITVi_tDmWPgWse5yLO1mHAKGx13g4Ils';
const chatId = '8283594833';

const bot = new TelegramBot(token, { polling: false });

export async function sendTelegramMessage(message: string) {
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log("Telegram message sent successfully.");
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
}
