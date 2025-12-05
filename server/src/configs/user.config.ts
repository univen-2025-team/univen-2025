export const USER_PUBLIC_FIELDS: (keyof model.auth.UserSchema)[] = [
    '_id',
    'email',
    'user_avatar',
    'user_fullName',
    'user_role',
    'user_gender',
    'user_status',
    'user_dayOfBirth',
    'balance'
];

export const USER_INIT_BALANCE = 20_000_000;
