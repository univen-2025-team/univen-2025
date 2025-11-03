import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SampleUniven2025 - Sàn Giao Dịch Chứng Khoán',
    description: 'Nền tảng giao dịch chứng khoán giả lập'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
