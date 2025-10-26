import '@/app/globals.css';
import { Geist } from 'next/font/google';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function RootLayout({ children }: Props) {
  return (
    <html lang={'ja'} suppressHydrationWarning>
      <body className={`${geistSans.className} overflow-x-hidden scroll-smooth antialiased`}>
        {children}
      </body>
    </html>
  );
}
