import Image from "next/image";
import { type UserProfile } from "@/lib/api/user.api";
import StatusBadge from "./StatusBadge";

type ProfileHeaderCardProps = {
  profile: UserProfile;
};

const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('vi-VN').format(balance);
};

export default function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  return (
    <div className="bg-primary rounded-xl p-8 text-white">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          {profile.user_avatar ? (
            <Image
              src={profile.user_avatar}
              alt={profile.user_fullName}
              width={120}
              height={120}
              className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {profile.user_fullName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-2 right-2">
            <StatusBadge status={profile.user_status} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">{profile.user_fullName}</h2>
          <div className="flex items-center gap-4 text-white/90">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {profile.user_gender ? "Nam" : "Nữ"}
            </span>
            <span className="inline-flex items-center gap-2 capitalize">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {profile.role_name || "User"}
            </span>
          </div>

          <div className="text-2xl font-bold">
            Số dư: {formatBalance(profile.balance)} VND
          </div>
        </div>
      </div>
    </div>
  );
}

