import { ReactNode } from "react";

type ProfileDetailFieldProps = {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  className?: string;
};

export default function ProfileDetailField({ 
  label, 
  value, 
  icon, 
  className = "" 
}: ProfileDetailFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className="text-gray-900">{value}</span>
      </div>
    </div>
  );
}

