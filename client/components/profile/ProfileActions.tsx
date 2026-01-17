import Link from "next/link";

type ProfileActionsProps = {
  onPasswordChange?: () => void;
};

export default function ProfileActions({ onPasswordChange }: ProfileActionsProps) {
  return (
    <div className="flex gap-4">
      <Link
        href="/profile/edit"
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-center inline-block"
      >
        Cập nhật thông tin
      </Link>
    </div>
  );
}

