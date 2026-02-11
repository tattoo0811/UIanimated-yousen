import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "巡の運命診断室 | 算命学ダッシュボード",
    template: "%s | 巡の運命診断室",
  },
  description:
    "120話の物語を通じて東洋の運命学「算命学」を学ぶダッシュボード。主人公・九条巡の17年間の旅路と共に、自分自身の運命について考えましょう。",
  keywords: ["算命学", "四柱推命", "運命診断", "東洋占星術", "巡の運命診断室"],
  openGraph: {
    title: "巡の運命診断室",
    description: "120話の物語で学ぶ算命学ダッシュボード",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
