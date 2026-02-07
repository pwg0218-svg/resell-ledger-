import TelegramBot from 'node-telegram-bot-api';

// Configuration
const token = '8409217855:AAEITVi_tDmWPgWse5yLO1mHAKGx13g4Ils';
const chatId = '8283594833';

const bot = new TelegramBot(token, { polling: false });

async function test() {
    console.log("Sending test message...");
    try {
        await bot.sendMessage(chatId, "🤖 *[Resell AI Hub]*\n\n시스템 연결 성공!\n대표님, 텔레그램 비서가 준비되었습니다. 충성! 🫡", { parse_mode: 'Markdown' });
        console.log("Telegram message sent successfully.");
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
}

test();
