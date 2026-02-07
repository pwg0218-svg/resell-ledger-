import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer', 'node-telegram-bot-api'],
};

export default nextConfig;
