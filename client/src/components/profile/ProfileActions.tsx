import Link from 'next/link';

type ProfileActionsProps = {
    onPasswordChange?: () => void;
};

export default function ProfileActions({ onPasswordChange }: ProfileActionsProps) {
    return (
        <div className="flex gap-4">
            <Link
                href="/dashboard/profile/edit"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium text-center inline-block shadow-lg shadow-violet-500/20"
            >
                Cập nhật thông tin
            </Link>
        </div>
    );
}
