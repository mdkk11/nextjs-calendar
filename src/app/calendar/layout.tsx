import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '@/app/globals.css';
import meta from '@/config/meta';
import { QueryProvider } from '@/features/calendar/providers/query-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.className} overflow-x-hidden scroll-smooth antialiased`}>
        <NuqsAdapter>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
