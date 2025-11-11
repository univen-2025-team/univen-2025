import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import {
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI
} from '@/configs/google-oauth.config';

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: GOOGLE_OAUTH_REDIRECT_URI
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log('Google profile:', profile);

            return cb(null, profile);
        }
    )
);
