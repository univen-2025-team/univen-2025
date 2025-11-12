"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userApi, type UserProfile } from "@/lib/api/user.api";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { selectUser, setUser } from "@/lib/store/authSlice";

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
};

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectUser);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formik = useFormik<UpdateProfileFormData>({
    initialValues: {
      user_fullName: profile?.user_fullName || "",
      email: profile?.email || "",
      user_gender: profile?.user_gender || false,
      user_dayOfBirth: "",
    },
    enableReinitialize: true,
    validationSchema: updateProfileSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccessMessage(null);

        // Only send fields that have changed
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

        if (Object.keys(updateData).length === 0) {
          setError("Không có thay đổi nào để cập nhật");
          return;
        }

        const updatedProfile = await userApi.updateProfile(updateData);
        
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="user_fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="user_fullName"
                name="user_fullName"
                type="text"
                value={formik.values.user_fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  formik.touched.user_fullName && formik.errors.user_fullName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900`}
                placeholder="Nhập họ và tên"
              />
            </div>
            {formik.touched.user_fullName && formik.errors.user_fullName && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formik.errors.user_fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900`}
                placeholder="example@email.com"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formik.errors.email}
              </p>
            )}
          </div>

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
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Nam</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="user_gender"
                  checked={formik.values.user_gender === false}
                  onChange={() => formik.setFieldValue("user_gender", false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Nữ</span>
              </label>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="user_dayOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày sinh
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="user_dayOfBirth"
                name="user_dayOfBirth"
                type="date"
                value={formik.values.user_dayOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                max={new Date().toISOString().split('T')[0]}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  formik.touched.user_dayOfBirth && formik.errors.user_dayOfBirth
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900`}
              />
            </div>
            {formik.touched.user_dayOfBirth && formik.errors.user_dayOfBirth && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formik.errors.user_dayOfBirth}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <p className="text-xs text-blue-800 font-medium mb-1">Lưu ý</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Chỉ các trường được thay đổi mới được cập nhật</li>
              <li>• Email phải là duy nhất trong hệ thống</li>
              <li>• Ngày sinh không thể trong tương lai</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
