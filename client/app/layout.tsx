<<<<<<< HEAD
import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/lib/store/Provider';
import { ToastProvider } from '@/src/components/toast/toast-provider';
import { appConfig } from '@/src/config';
import { APP_URL } from '@/src/config/app';

export const metadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: appConfig.seo.title,
    description: appConfig.seo.description,
    keywords: appConfig.seo.keywords,
    openGraph: {
        title: appConfig.seo.title,
        description: appConfig.seo.description,
        images: [appConfig.seo.ogImage]
    },
    icons: {
        icon: '/stockie-logo.png',
        shortcut: '/stockie-logo.png',
        apple: '/stockie-logo.png'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang={appConfig.settings.defaultLanguage} suppressHydrationWarning>
            <body className="antialiased">
                <ReduxProvider>
                    <ToastProvider>{children}</ToastProvider>
                </ReduxProvider>
            </body>
        </html>
    );
=======
import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/lib/store/Provider";
import { appConfig } from "@/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: appConfig.seo.title,
  description: appConfig.seo.description,
  keywords: appConfig.seo.keywords,
  openGraph: {
    title: appConfig.seo.title,
    description: appConfig.seo.description,
    images: [appConfig.seo.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={appConfig.settings.defaultLanguage}>
      <body className="antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
>>>>>>> f255a1a0 (rename: client-new => client)
}
