import { Router } from 'express';

// Route child
import authRoute from './auth/index.js';
import otpRoute from './otp/index.js';
import userRoute from './user/index.js';
import viewRoute from './views/index.js';

const rootRoute = Router();

/* -------------------------- Auth -------------------------- */
rootRoute.use('/auth', authRoute);

/* --------------------------- OTP -------------------------- */
rootRoute.use('/otp', otpRoute);

/* -------------------------- User -------------------------- */
rootRoute.use('/user', userRoute);

export default rootRoute;