import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '@/app/globals.css';
import meta from '@/config/meta';
import { QueryProvider } from '@/features/calendar/providers/query-provider';

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
  console.log(locale);
  return (
    <NuqsAdapter>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
