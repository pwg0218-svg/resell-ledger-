import { NextResponse } from 'next/server';
import { runScraper } from '@/researchers/scraper';

export async function POST(request: Request) {
    try {
        const { brand, keyword } = await request.json();
        console.log(`Starting research for ${brand} with keyword: ${keyword}`);

        // Run scraper (this will launch a browser on the server)
        const results = await runScraper(brand, keyword);

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Research failed:", error);
        return NextResponse.json({ success: false, error: "Research failed" }, { status: 500 });
    }
}
