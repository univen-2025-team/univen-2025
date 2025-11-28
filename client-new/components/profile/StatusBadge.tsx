type StatusBadgeProps = {
  status: string;
  className?: string;
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const isActive = status === "ACTIVE";
  const label = isActive ? "Hoạt động" : "Không hoạt động";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
      isActive 
        ? "bg-green-500 text-white" 
        : "bg-red-500 text-white"
    } ${className}`}>
      {label}
    </span>
  );
}

