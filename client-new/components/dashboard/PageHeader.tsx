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
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-blue-100 text-lg">{description}</p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            {icon || defaultIcon}
          </div>
        </div>
      </div>
    </div>
  );
}

