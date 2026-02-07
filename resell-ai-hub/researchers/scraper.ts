import puppeteer from 'puppeteer';

interface Product {
    title: string;
    price: number;
    url: string;
    image: string;
    brand: string;
}

export async function runScraper(brand: string, keyword: string = "running shoes"): Promise<Product[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const results: Product[] = [];

    try {
        // Logic for different brands
        let url = "";
        if (brand === 'nike') {
            url = `https://www.nike.com/kr/ko_kr/search?q=${encodeURIComponent(keyword)}`;
        } else if (brand === 'adidas') {
            url = `https://www.adidas.co.kr/search?q=${encodeURIComponent(keyword)}`;
        }

        if (url) {
            await page.goto(url, { waitUntil: 'networkidle2' });
            // specific selector logic (mock for now)
        }

    } catch (error) {
        console.error(`Error scraping ${brand}:`, error);
    } finally {
        await browser.close();
    }

    return results;
}
