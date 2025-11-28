"use client";

import { useState, useEffect } from "react";
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
          <FormInput
            id="user_fullName"
            name="user_fullName"
            label="Họ và tên"
            type="text"
            value={formik.values.user_fullName}
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
            value={formik.values.email}
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

          <FormInput
            id="user_dayOfBirth"
            name="user_dayOfBirth"
            label="Ngày sinh"
            type="date"
            value={formik.values.user_dayOfBirth}
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
}
