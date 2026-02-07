import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Resell AI Hub",
  description: "AI-powered Resell & Tax Automation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* FORCE LIGHT THEME BACKGROUND TO MATCH ORIGINAL GLASS DESIGN */}
      <body className={`${notoSansKr.className} antialiased min-h-screen bg-[#F3F4F6] text-[#111827]`}>
        <div id="layout-verifier" style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1, background: 'red', zIndex: 9999 }}></div>
        {children}
      </body>
    </html>
  );
}
