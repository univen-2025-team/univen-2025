"use client";

import { useState, useEffect } from "react";
import { userApi, type UserProfile } from "@/lib/api/user.api";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { selectUser, setUser } from "@/lib/store/authSlice";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import ProfilePageHeader from "@/components/profile/ProfilePageHeader";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import ProfileDetailField from "@/components/profile/ProfileDetailField";
import ProfileActions from "@/components/profile/ProfileActions";
import StatusBadge from "@/components/profile/StatusBadge";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduxUser = useAppSelector(selectUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userApi.getProfile();
        setProfile(data);

        // Sync with Redux store
        dispatch(setUser({
          _id: data._id,
          email: data.email,
          user_fullName: data.user_fullName,
          user_avatar: data.user_avatar,
          user_role: data.user_role,
          user_gender: data.user_gender,
          user_status: data.user_status,
          user_dayOfBirth: data.user_dayOfBirth,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin người dùng");
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const displayProfile = profile || reduxUser;

  if (!displayProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  // Ensure we have a valid profile with all required fields
  const displayProfileData: UserProfile = profile || {
    _id: reduxUser!._id,
    email: reduxUser!.email,
    user_fullName: reduxUser!.user_fullName,
    user_avatar: reduxUser!.user_avatar,
    user_role: reduxUser!.user_role,
    user_gender: reduxUser!.user_gender,
    user_status: reduxUser!.user_status,
    user_dayOfBirth: reduxUser!.user_dayOfBirth,
    role_name: "User",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfilePageHeader />

      <ProfileHeaderCard profile={displayProfileData} />

      {/* Details Section */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Chi tiết tài khoản</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ProfileDetailField
            label="Email"
            value={profile?.email || displayProfileData.email || "N/A"}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <ProfileDetailField
            label="Họ và tên"
            value={displayProfileData.user_fullName}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <ProfileDetailField
            label="Giới tính"
            value={displayProfileData.user_gender ? "Nam" : "Nữ"}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <ProfileDetailField
            label="Vai trò"
            value={<span className="capitalize">{displayProfileData.role_name || "User"}</span>}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          <ProfileDetailField
            label="Trạng thái"
            value={
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${displayProfileData.user_status === "ACTIVE" ? "bg-success" : "bg-error"
                  }`}></div>
                <span>{displayProfileData.user_status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}</span>
              </div>
            }
          />

        </div>
      </div>
    </div>
  );
}
