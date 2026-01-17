<<<<<<< HEAD
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userApi, type UserProfile } from '@/lib/api/user.api';
import { getMediaUrl } from '@/lib/api/media.api';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectUser, setUser } from '@/lib/store/authSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import FormInput from '@/components/forms/FormInput';
import InfoBox from '@/components/common/InfoBox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Validation schema based on backend zod schema
const updateProfileSchema = Yup.object({
    user_fullName: Yup.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên không được quá 100 ký tự'),
    email: Yup.string().email('Email không hợp lệ'),
    user_gender: Yup.boolean(),
    user_dayOfBirth: Yup.date().max(new Date(), 'Ngày sinh không thể trong tương lai').nullable()
});

type UpdateProfileFormData = {
    user_fullName?: string;
    email?: string;
    user_gender?: boolean;
    user_dayOfBirth?: string;
};

export default function EditProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const reduxUser = useAppSelector(selectUser);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null); // Store original for comparison
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Avatar upload states
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

    // Fetch current profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await userApi.getProfile();
                setProfile(data);
                setOriginalProfile(data); // Store original profile for comparison
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải thông tin');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const formik = useFormik<UpdateProfileFormData>({
        initialValues: {
            user_fullName: profile?.user_fullName || '',
            email: profile?.email || '',
            user_gender: profile?.user_gender || false,
            user_dayOfBirth: ''
        },
        enableReinitialize: true,
        validationSchema: updateProfileSchema,
        onSubmit: async (values) => {
            try {
                setError(null);
                setSuccessMessage(null);

                // Only send fields that have changed (compare against original profile data)
                const updateData: UpdateProfileFormData = {};
                if (
                    values.user_fullName &&
                    values.user_fullName !== originalProfile?.user_fullName
                ) {
                    updateData.user_fullName = values.user_fullName;
                }
                if (values.email && values.email !== originalProfile?.email) {
                    // Server expects user_email, not email
                    (updateData as Record<string, unknown>).user_email = values.email;
                }
                if (
                    values.user_gender !== undefined &&
                    values.user_gender !== originalProfile?.user_gender
                ) {
                    updateData.user_gender = values.user_gender;
                }
                if (values.user_dayOfBirth) {
                    updateData.user_dayOfBirth = values.user_dayOfBirth;
                }

                if (Object.keys(updateData).length === 0) {
                    setError('Không có thay đổi nào để cập nhật');
                    return;
                }

                const updatedProfile = await userApi.updateProfile(updateData);

                // Update Redux state
                if (reduxUser) {
                    dispatch(
                        setUser({
                            ...reduxUser,
                            ...updatedProfile
                        })
                    );
                }

                setSuccessMessage('Cập nhật thông tin thành công!');
                setProfile(updatedProfile);

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
            }
        }
    });

    // Avatar file change handler - show preview dialog
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn file ảnh');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Ảnh không được vượt quá 5MB');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsPreviewDialogOpen(true);
            setError(null);
        }
    };

    // Cancel preview dialog
    const handleCancelPreview = () => {
        setIsPreviewDialogOpen(false);
        setAvatarFile(null);
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }
    };

    // Confirm avatar upload
    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        try {
            setIsUploadingAvatar(true);
            setError(null);

            await userApi.uploadAvatar(avatarFile);

            // Refetch profile to get updated avatar
            const updatedProfile = await userApi.getProfile();
            setProfile(updatedProfile);

            // Update Redux state
            dispatch(
                setUser({
                    _id: updatedProfile._id,
                    email: updatedProfile.email,
                    user_fullName: updatedProfile.user_fullName,
                    user_avatar: updatedProfile.user_avatar,
                    user_role: updatedProfile.user_role,
                    balance: updatedProfile.balance ?? 0,
                    user_gender: updatedProfile.user_gender,
                    user_status: updatedProfile.user_status,
                    user_dayOfBirth: updatedProfile.user_dayOfBirth
                })
            );

            setSuccessMessage('Cập nhật ảnh đại diện thành công!');
            handleCancelPreview();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload ảnh thất bại');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thông tin</h1>
                </div>
                <p className="text-gray-600 ml-11">Cập nhật thông tin cá nhân của bạn</p>
            </div>

            {successMessage && <SuccessMessage message={successMessage} className="mb-6" />}
            {error && <ErrorMessage message={error} className="mb-6" />}

            {/* Avatar Upload Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
                <div className="flex items-center gap-6">
                    {/* Avatar Preview */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                            {getMediaUrl(profile?.user_avatar) ? (
                                <img
                                    src={getMediaUrl(profile?.user_avatar)!}
                                    alt="Current avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                    <span className="text-2xl font-bold text-white">
                                        {profile?.user_fullName?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors font-medium"
                        >
                            Chọn ảnh mới
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                            Chấp nhận JPG, PNG, GIF. Tối đa 5MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Xem trước ảnh đại diện</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Preview image */}
                        <div className="flex justify-center">
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Preview"
                                    className="w-48 h-48 rounded-full object-cover border-4 border-primary shadow-lg"
                                />
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleCancelPreview}
                                disabled={isUploadingAvatar}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAvatarUpload}
                                disabled={isUploadingAvatar}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUploadingAvatar ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
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
                                        Đang tải...
                                    </>
                                ) : (
                                    'Xác nhận'
                                )}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <FormInput
                        id="user_fullName"
                        name="user_fullName"
                        label="Họ và tên"
                        type="text"
                        value={formik.values.user_fullName ?? ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Nhập họ và tên"
                        icon={
                            <svg
                                className="h-5 w-5"
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
                        }
                        error={formik.errors.user_fullName}
                        touched={formik.touched.user_fullName}
                    />

                    <FormInput
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={formik.values.email ?? ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="example@email.com"
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        }
                        error={formik.errors.email}
                        touched={formik.touched.email}
                    />

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Giới tính
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="user_gender"
                                    checked={formik.values.user_gender === true}
                                    onChange={() => formik.setFieldValue('user_gender', true)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-gray-700">Nam</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="user_gender"
                                    checked={formik.values.user_gender === false}
                                    onChange={() => formik.setFieldValue('user_gender', false)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-gray-700">Nữ</span>
                            </label>
                        </div>
                    </div>

                    <FormInput
                        id="user_dayOfBirth"
                        name="user_dayOfBirth"
                        label="Ngày sinh"
                        type="date"
                        value={formik.values.user_dayOfBirth ?? ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        max={new Date().toISOString().split('T')[0]}
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        }
                        error={formik.errors.user_dayOfBirth}
                        touched={formik.touched.user_dayOfBirth}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={formik.isSubmitting || !formik.isValid}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {formik.isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
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
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={formik.isSubmitting}
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>

            <InfoBox
                title="Lưu ý"
                items={[
                    'Chỉ các trường được thay đổi mới được cập nhật',
                    'Email phải là duy nhất trong hệ thống',
                    'Ngày sinh không thể trong tương lai'
                ]}
                className="mt-6"
            />
        </div>
    );
=======
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userApi, type UserProfile } from "@/lib/api/user.api";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { selectUser, setUser } from "@/lib/store/authSlice";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import SuccessMessage from "@/components/common/SuccessMessage";
import FormInput from "@/components/forms/FormInput";
import InfoBox from "@/components/common/InfoBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Validation schema based on backend zod schema
const updateProfileSchema = Yup.object({
  user_fullName: Yup.string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự"),
  email: Yup.string().email("Email không hợp lệ"),
  user_gender: Yup.boolean(),
  user_dayOfBirth: Yup.date()
    .max(new Date(), "Ngày sinh không thể trong tương lai")
    .nullable(),
});

type UpdateProfileFormData = {
  user_fullName?: string;
  email?: string;
  user_gender?: boolean;
  user_dayOfBirth?: string;
  user_avatar?: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getProfile();
        setProfile(data);
        // If user_avatar is a mediaId, construct full URL
        const avatarUrl = data.user_avatar 
          ? `http://localhost:4000/static/${data.user_avatar}`
          : null;
        setAvatarPreview(avatarUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh (jpg, png, gif, ...)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.user_avatar || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formik = useFormik<UpdateProfileFormData>({
    initialValues: {
      user_fullName: profile?.user_fullName ?? "",
      email: profile?.email ?? "",
      user_gender: profile?.user_gender ?? false,
      user_dayOfBirth: profile?.user_dayOfBirth ?? "",
    },
    enableReinitialize: true,
    validationSchema: updateProfileSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccessMessage(null);

        // Handle avatar upload first if there's a new file
        if (avatarFile) {
          const formData = new FormData();
          formData.append('avatar', avatarFile);
          
          try {
            // Upload avatar to backend server
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
              throw new Error('Vui lòng đăng nhập lại để upload ảnh');
            }

            console.log('Uploading to: http://localhost:4000/api/v1/user/upload-avatar');
            console.log('Token exists:', !!token);
            
            const uploadResponse = await fetch('http://localhost:4000/api/v1/user/upload-avatar', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            });

            console.log('Upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
              let errorMessage = 'Không thể upload ảnh. Vui lòng thử lại.';
              try {
                const errorData = await uploadResponse.json();
                console.log('Error data:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
              } catch (e) {
                const textError = await uploadResponse.text();
                console.log('Error text:', textError);
                errorMessage = textError || errorMessage;
              }
              throw new Error(errorMessage);
            }

            const uploadData = await uploadResponse.json();
            console.log('Upload success:', uploadData);
            
            // Backend trả về user với user_avatar là mediaId
            const mediaId = uploadData.metadata?.user_avatar;
            if (mediaId) {
              const avatarUrl = `http://localhost:4000/static/${mediaId}`;
              setAvatarPreview(avatarUrl);
              setProfile(prev => prev ? { ...prev, user_avatar: mediaId } : null);
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(uploadError instanceof Error ? uploadError.message : 'Lỗi khi upload ảnh');
          }
        }

        // Only send fields that have changed (excluding avatar as it's already uploaded)
        const updateData: UpdateProfileFormData = {};
        if (values.user_fullName && values.user_fullName !== profile?.user_fullName) {
          updateData.user_fullName = values.user_fullName;
        }
        if (values.email && values.email !== profile?.email) {
          updateData.email = values.email;
        }
        if (values.user_gender !== undefined && values.user_gender !== profile?.user_gender) {
          updateData.user_gender = values.user_gender;
        }
        if (values.user_dayOfBirth) {
          updateData.user_dayOfBirth = values.user_dayOfBirth;
        }

        // Only call updateProfile if there are other changes besides avatar
        let updatedProfile = profile;
        if (Object.keys(updateData).length > 0) {
          updatedProfile = await userApi.updateProfile(updateData);
        } else if (avatarFile) {
          // If only avatar was uploaded, refetch profile
          updatedProfile = await userApi.getProfile();
        } else {
          setError("Không có thay đổi nào để cập nhật");
          return;
        }
        
        // Update Redux state
        if (reduxUser) {
          dispatch(setUser({
            ...reduxUser,
            ...updatedProfile,
          }));
        }

        setSuccessMessage("Cập nhật thông tin thành công!");
        setProfile(updatedProfile);

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Cập nhật thất bại");
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thông tin</h1>
        </div>
        <p className="text-gray-600 ml-11">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      {successMessage && <SuccessMessage message={successMessage} className="mb-6" />}
      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary/10">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar preview" />
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                  {profile?.user_fullName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors shadow-lg"
                  title="Xóa ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors cursor-pointer font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Chọn ảnh
              </label>
            </div>
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG hoặc GIF. Tối đa 5MB.
            </p>
          </div>

          <FormInput
            id="user_fullName"
            name="user_fullName"
            label="Họ và tên"
            type="text"
            value={formik.values.user_fullName || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nhập họ và tên"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            error={formik.errors.user_fullName}
            touched={formik.touched.user_fullName}
          />

          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="example@email.com"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Giới tính
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="user_gender"
                  checked={formik.values.user_gender === true}
                  onChange={() => formik.setFieldValue("user_gender", true)}
                  className="w-4 h-4 text-primary focus:ring-ring border-gray-300"
                />
                <span className="ml-2 text-gray-700">Nam</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="user_gender"
                  checked={formik.values.user_gender === false}
                  onChange={() => formik.setFieldValue("user_gender", false)}
                  className="w-4 h-4 text-primary focus:ring-ring border-gray-300"
                />
                <span className="ml-2 text-gray-700">Nữ</span>
              </label>
            </div>
          </div>

          <FormInput
            id="user_dayOfBirth"
            name="user_dayOfBirth"
            label="Ngày sinh"
            type="date"
            value={formik.values.user_dayOfBirth || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            max={new Date().toISOString().split('T')[0]}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            error={formik.errors.user_dayOfBirth}
            touched={formik.touched.user_dayOfBirth}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {formik.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu thay đổi
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={formik.isSubmitting}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <InfoBox
        title="Lưu ý"
        items={[
          "Chỉ các trường được thay đổi mới được cập nhật",
          "Email phải là duy nhất trong hệ thống",
          "Ngày sinh không thể trong tương lai"
        ]}
        className="mt-6"
      />
    </div>
  );
>>>>>>> f255a1a0 (rename: client-new => client)
}
