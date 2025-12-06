import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/lib/store/Provider';
import { ToastProvider } from '@/components/toast/toast-provider';
import { appConfig } from '@/config';
import { APP_URL } from '@/config/app';

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
        <html lang={appConfig.settings.defaultLanguage}>
            <body className="antialiased">
                <ReduxProvider>
                    <ToastProvider>{children}</ToastProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
