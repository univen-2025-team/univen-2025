import { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    description: string;
    icon?: ReactNode;
};

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    {title}
                </h1>
                <p className="text-gray-400 text-sm mt-1">{description}</p>
            </div>
        </div>
    );
}
