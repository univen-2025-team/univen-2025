import { ReactNode } from "react";

type InfoBoxProps = {
  title?: string;
  items: string[];
  icon?: ReactNode;
  className?: string;
};

export default function InfoBox({ 
  title = "Lưu ý", 
  items, 
  icon,
  className = "" 
}: InfoBoxProps) {
  const defaultIcon = (
    <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={`bg-blue-50 rounded-lg p-4 border border-blue-100 ${className}`}>
      <div className="flex">
        {icon || defaultIcon}
        <div className="ml-3">
          <p className="text-xs text-blue-800 font-medium mb-1">{title}</p>
          <ul className="text-xs text-blue-700 space-y-1">
            {items.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

