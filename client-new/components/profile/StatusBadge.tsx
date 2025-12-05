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
        ? "bg-success-light0 text-white" 
        : "bg-error-light0 text-white"
    } ${className}`}>
      {label}
    </span>
  );
}

