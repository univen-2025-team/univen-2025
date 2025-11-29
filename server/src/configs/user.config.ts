export const USER_PUBLIC_FIELDS: (keyof model.auth.UserSchema)[] = [
    '_id',
    'email',
    'user_avatar',
    'user_fullName',
    'user_role',
<<<<<<< HEAD
    "user_gender",
    "user_status",
    "user_dayOfBirth",
    "balance",
=======
    'user_gender',
    'user_status',
    'user_dayOfBirth',
    'balance'
>>>>>>> ea92ef4d712de077556c73c19678cf028ca8fded
];

export const USER_INIT_BALANCE = 10_000;
