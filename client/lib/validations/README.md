# Validation Schemas

Thư mục này chứa các Yup validation schemas được chia sẻ giữa client và server.

## Auth Schemas

### loginSchema
Validation cho form đăng nhập:
- `email`: string, email hợp lệ, 5-50 ký tự
- `password`: string, tối thiểu 8 ký tự, phải có chữ hoa, chữ thường và số

### signUpSchema
Validation cho form đăng ký:
- `user_fullName`: string, 4-30 ký tự
- `email`: string, email hợp lệ, 5-50 ký tự
- `password`: string, tối thiểu 8 ký tự, phải có chữ hoa, chữ thường và số
- `confirmPassword`: phải trùng với password
- `terms`: boolean, bắt buộc phải true

### forgotPasswordSchema
Validation cho form quên mật khẩu:
- `email`: string, email hợp lệ
- `newPassword`: string, tối thiểu 8 ký tự, phải có chữ hoa, chữ thường và số

## Usage

```typescript
import { loginSchema, signUpSchema } from '@/lib/validations';

// Sử dụng với Formik
const formik = useFormik({
  initialValues: { ... },
  validationSchema: loginSchema,
  onSubmit: (values) => { ... }
});
```
