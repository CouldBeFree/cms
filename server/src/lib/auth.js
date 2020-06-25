import passport from 'koa-passport';
import jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import FacebookStrategy from 'passport-facebook-token';
import { Strategy as GoogleStrategy } from 'passport-google-token';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import Account from '../models/Account';
import { env } from './env';

const localStrategy = new LocalStrategy({
    session: false
}, (username, password, done) => {
    fetchUser()
        .then(user => {
            if (username === user.username && password === user.password) {
                done(null, user);
            } else {
                done(null, false);
            }
        })
        .catch((err) => {
            done(err)
        });
});

const facebookStrategy = new FacebookStrategy({
    clientID: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
    callbackURL: env.FACEBOOK_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
    done(null, await loginWithProfile(profile, 'facebook'));
});

const googleStrategy = new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
    done(null, await loginWithProfile(profile, 'google'));
});

const jwtStrategy = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET_KEY,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
}, async (jwt_payload, done) => {
    done(null, await loginWithProfile(jwt_payload));
});

async function loginWithProfile(profile, accountType = null) {
    let email = ((profile && profile.emails && profile.emails[ 0 ]) || {}).value;
    const params = email ? { email } : { _id: profile._id };

    if (!email && accountType) { // if login with social we have email and do not include account type
        params.accountType = accountType;
    }

    let account = await Account.findOne(params);
    if (!account) {
        if (!email) {
            email = `${profile.id}@${accountType}`;
        }
        account = new Account({
            accountType,
            email,
            activated: true,
            activationDate: Date.now()
        });
    }
    account.loginDate = Date.now();
    await account.save();
    return account;
}

export
async function checkUser(ctx, next) {
    if (ctx.state.user) {
        await next();
    } else {
        ctx.redirect('/signin');//badRequest();
    }
}

export
function generateJwt(user) {
    return jwt.sign({ _id: user._id }, env.JWT_SECRET_KEY, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE
    });
}

passport.serializeUser((account, done) => {
    done(null, account._id)
});

passport.deserializeUser(async (_id, done) => {
    try {
        done(null, await Account.findOne({ _id, removed: { $exists: false }, activated: true }));
    } catch (err) {
        done(err);
    }
});

passport.use(localStrategy);
passport.use(facebookStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

export { passport };
