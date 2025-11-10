# Validation Schemas

Thư mục này chứa các validation schemas cho server.

## Zod Schemas (`/zod`)
Sử dụng Zod cho validation phía server với TypeScript.

## Yup Schemas (`/yup`)
Sử dụng Yup cho validation - được chia sẻ với client-side validation.

### Auth Schemas

#### loginSchema
- `email`: email hợp lệ, 5-50 ký tự
- `password`: tối thiểu 8 ký tự, có chữ hoa, chữ thường và số

#### signUpSchema
- `user_fullName`: 4-30 ký tự
- `email`: email hợp lệ, 5-50 ký tự  
- `password`: tối thiểu 8 ký tự, có chữ hoa, chữ thường và số

#### forgotPasswordSchema
- `email`: email hợp lệ
- `newPassword`: tối thiểu 8 ký tự, có chữ hoa, chữ thường và số

## Usage

### Zod (Server)
```typescript
import { loginSchema } from './validations/zod';

const result = loginSchema.parse(data);
```

### Yup (Client/Server)
```typescript
import { loginSchema } from './validations/yup';

await loginSchema.validate(data);
```
