import Link from "next/link";

type ProfileActionsProps = {
  onPasswordChange?: () => void;
};

export default function ProfileActions({ onPasswordChange }: ProfileActionsProps) {
  return (
    <div className="flex gap-4">
      <Link
        href="/profile/edit"
        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
      >
        Cập nhật thông tin
      </Link>
      <button 
        onClick={onPasswordChange}
        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        Đổi mật khẩu
      </button>
    </div>
  );
}

