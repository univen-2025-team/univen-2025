'use client';

import { useState, useRef } from 'react';
import { type UserProfile, userApi } from '@/lib/api/user.api';
import { getMediaUrl } from '@/lib/api/media.api';
import StatusBadge from './StatusBadge';

type ProfileHeaderCardProps = {
    profile: UserProfile;
    onAvatarChange?: (newAvatarId: string) => void;
};

const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('vi-VN').format(balance);
};

export default function ProfileHeaderCard({ profile, onAvatarChange }: ProfileHeaderCardProps) {
    const avatarUrl = getMediaUrl(profile.user_avatar);
    const [isHovered, setIsHovered] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh không được vượt quá 5MB');
            return;
        }

        try {
            setIsUploading(true);
            const result = await userApi.uploadAvatar(file);
            onAvatarChange?.(result.avatarUrl);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Upload ảnh thất bại');
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-primary rounded-xl p-8 text-white">
            <div className="flex items-center gap-6">
                {/* Avatar with hover upload */}
                <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleAvatarClick}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={profile.user_fullName}
                            className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-30 h-30 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="text-5xl font-bold text-white">
                                {profile.user_fullName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div
                        className={`absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center transition-opacity duration-200 ${
                            isHovered || isUploading ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {isUploading ? (
                            <svg
                                className="animate-spin h-8 w-8 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <>
                                <svg
                                    className="w-8 h-8 text-white mb-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span className="text-white text-sm font-medium">Đổi ảnh</span>
                            </>
                        )}
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

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
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            {profile.user_gender ? 'Nam' : 'Nữ'}
                        </span>
                        <span className="inline-flex items-center gap-2 capitalize">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            {profile.role_name || 'User'}
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
