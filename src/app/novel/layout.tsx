import { Shippori_Mincho } from 'next/font/google';

const shipporiMincho = Shippori_Mincho({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-novel',
});

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${shipporiMincho.variable} relative min-h-screen min-h-[100dvh] bg-[#0a0e17] text-[#e8eef5] antialiased`}
      style={{
        fontFamily: 'var(--font-novel), "Shippori Mincho", "Hiragino Mincho ProN", serif',
      }}
    >
      {children}
    </div>
  );
}
