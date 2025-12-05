import * as Yup from 'yup';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const userBase = Yup.object({
    /* -------------------------- Auth -------------------------- */
    email: Yup.string()
        .email('Email không hợp lệ')
        .min(5, 'Email phải có ít nhất 5 ký tự')
        .max(50, 'Email không được quá 50 ký tự')
        .required('Vui lòng nhập email'),
    
    password: Yup.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
        )
        .required('Vui lòng nhập mật khẩu'),

    /* ----------------------- Information ---------------------- */
    user_fullName: Yup.string()
        .min(4, 'Họ và tên phải có ít nhất 4 ký tự')
        .max(30, 'Họ và tên không được quá 30 ký tự')
        .required('Vui lòng nhập họ và tên'),
});

/* ------------------------------------------------------ */
/*                      Login schema                      */
/* ------------------------------------------------------ */
export const loginSchema = Yup.object({
    email: userBase.fields.email,
    password: userBase.fields.password,
});

export type LoginSchema = Yup.InferType<typeof loginSchema>;

/* ------------------------------------------------------ */
/*                    Sign up schema                      */
/* ------------------------------------------------------ */
export const signUpSchema = Yup.object({
    user_fullName: userBase.fields.user_fullName,
    email: userBase.fields.email,
    password: userBase.fields.password,
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu'),
    terms: Yup.boolean()
        .oneOf([true], 'Bạn phải đồng ý với điều khoản dịch vụ')
        .required('Bạn phải đồng ý với điều khoản dịch vụ'),
});

export type SignUpSchema = Yup.InferType<typeof signUpSchema>;

/* ------------------------------------------------------ */
/*                    Forgot password schema              */
/* ------------------------------------------------------ */
export const forgotPasswordSchema = Yup.object({
    email: userBase.fields.email,
    newPassword: userBase.fields.password,
});

export type ForgotPasswordSchema = Yup.InferType<typeof forgotPasswordSchema>;
