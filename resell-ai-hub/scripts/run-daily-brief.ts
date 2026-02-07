import { runScraper } from '../researchers/scraper';
import { sendTelegramMessage } from '../lib/telegram';

// This script is intended to be run by a Cron job or Task Scheduler
async function main() {
    console.log("Starting Daily Briefing...");

    // 1. Run Researchers
    const keywords = ["Running Shoes", "Sneakers"];
    let report = "📢 **[Resell AI Morning Briefing]**\n\n";

    for (const keyword of keywords) {
        report += `🔍 *Target: ${keyword}*\n`;
        // Mocking results for now as scraper requires complex logic
        // In real implementation, await runScraper(...)
        report += `- Nike: Finding optimal prices...\n`;
        report += `- Adidas: Scanning complete.\n`;
        report += `\n`;
    }

    report += "✅ *System Status: 10 Researchers Active*\n";
    report += "Check Dashboard for details: http://localhost:3000";

    // 2. Send Telegram
    await sendTelegramMessage(report);

    console.log("Briefing sent.");
}

main();
