import { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-2">{title}</h1>
          <p className="text-[#718096] text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

