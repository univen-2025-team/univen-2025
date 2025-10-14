import { CLEAN_UP_KEY_TOKEN_CRON_TIME, getCronOptions } from '@/configs/scheduled.config.js';

// Models
import keyTokenModel from '@/models/keyToken.model.js';

// Services
import JwtService from './jwt.service.js';
import LoggerService from './logger.service.js';

// Libs
import { asyncFilter } from '@/utils/array.utils.js';
import { CronJob } from 'cron';
import { deleteKeyToken, setKeyToken } from './redis.service.js';

export default class ScheduledService {
    private static lastSyncTime: Date | null = null;

    public static startScheduledService = () => {
        this.cleanUpKeyTokenCronJob.start();
    };

    /* ------------------------------------------------------ */
    /*          Cleanup key token expired or banned           */
    /* ------------------------------------------------------ */
    private static handleCleanUpKeyToken = async () => {
        const allKeyTokens = await keyTokenModel.find();

        /* -------------------- Reset counter ------------------- */
        let keyTokenCleaned = 0,
            refreshTokenUsedCleaned = 0;

        await Promise.allSettled(
            allKeyTokens.map(async (keyToken) => {
                /* ------------- Check current refresh token ------------ */
                const decoded = await JwtService.verifyJwt({
                    token: keyToken.refresh_token,
                    publicKey: keyToken.public_key
                });

                if (!decoded) {
                    await keyToken.deleteOne();
                    await deleteKeyToken(keyToken.user.toString());

                    throw new Error('Invalid key token');
                }

                /* -------------- Check used refresh token -------------- */
                const newRefreshTokensUsed = await asyncFilter(
                    keyToken.refresh_tokens_used,
                    async (refreshTokenUsed) => {
                        const payload = JwtService.parseJwtPayload(refreshTokenUsed);

                        if (!payload) return false;
                        if (payload.exp * 1000 <= Date.now()) return false;

                        return true;
                    }
                );

                /* ----------------- Update cleanup data ---------------- */
                keyToken.set('refresh_tokens_used', newRefreshTokensUsed);

                await keyToken.save();
                await setKeyToken(keyToken.toObject());

                /* --------- Counting refresh token used removed --------- */
                refreshTokenUsedCleaned +=
                    keyToken.refresh_tokens_used.length - newRefreshTokensUsed.length;

                return true;
            })
        )
            /* -------------- Counting key token removed ------------- */
            .then((resultList) => {
                keyTokenCleaned = resultList.filter((x) => x.status === 'rejected').length;
            })
            /* --------------------- Show result -------------------- */
            .then(() => {
                LoggerService.getInstance().info(
                    `Cleanup key token: ${keyTokenCleaned} key token cleaned`
                );
                LoggerService.getInstance().info(
                    `Cleanup key token: ${refreshTokenUsedCleaned} refresh token used cleaned`
                );
            });
    };

    /* ------------------------------------------------------ */
    /*                       Cron jobs                        */
    /* ------------------------------------------------------ */
    public static cleanUpKeyTokenCronJob = CronJob.from(
        getCronOptions({
            cronTime: CLEAN_UP_KEY_TOKEN_CRON_TIME,
            onTick: ScheduledService.handleCleanUpKeyToken,
            onComplete: () => {}
        })
    );
}
