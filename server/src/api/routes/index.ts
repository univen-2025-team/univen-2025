import { Router } from 'express';

// Route child
import authRoute from './auth/index.js';
import otpRoute from './otp/index.js';
import userRoute from './user/index.js';
import viewRoute from './views/index.js';
import chatRoute from './chats/index.js';
import stockTransactionRoute from './stockTransaction/index.js';
import marketCacheRoute from './market-cache.route.js';

const rootRoute = Router();

/* -------------------------- Auth -------------------------- */
rootRoute.use('/auth', authRoute);

/* --------------------------- OTP -------------------------- */
rootRoute.use('/otp', otpRoute);

/* -------------------------- User -------------------------- */
rootRoute.use('/user', userRoute);

/* -------------------------- Chat ------------------------- */
rootRoute.use('/chats', chatRoute);

/* ---------------------- Stock Transaction ---------------------- */
rootRoute.use('/stock-transactions', stockTransactionRoute);

/* ---------------------- Market Cache (Cached Data) ---------------------- */
rootRoute.use('/market', marketCacheRoute);

export default rootRoute;
