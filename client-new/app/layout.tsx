import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/lib/store/Provider";
import { appConfig } from "@/config";

export const metadata: Metadata = {
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
}
