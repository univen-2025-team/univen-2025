import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/lib/store/Provider';
import { ToastProvider } from '@/components/toast/toast-provider';
import { appConfig } from '@/config';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: appConfig.seo.title,
    description: appConfig.seo.description,
    keywords: appConfig.seo.keywords,
    openGraph: {
        title: appConfig.seo.title,
        description: appConfig.seo.description,
        images: [appConfig.seo.ogImage]
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
