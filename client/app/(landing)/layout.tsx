import { LandingHeader } from '@/components/landing-page/landing-header';
import { LandingFooter } from '@/components/landing-page/landing-footer';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingHeader />
            <main>{children}</main>
            <LandingFooter />
        </>
    );
}
