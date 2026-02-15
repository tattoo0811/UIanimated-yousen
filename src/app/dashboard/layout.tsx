import { Shippori_Mincho } from 'next/font/google';

const shipporiMincho = Shippori_Mincho({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-shippori-mincho',
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${shipporiMincho.variable} font-[family-name:var(--font-shippori-mincho)]`}>
      {children}
    </div>
  );
}
