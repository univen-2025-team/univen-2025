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
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">{title}</h1>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
        </div>
    );
}
