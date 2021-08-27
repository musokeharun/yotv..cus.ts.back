// Strings
export const paramMissingError = 'One or more of the required parameters was missing.';
export const loginFailedErr = 'Login failed';
export const resourceCreated = "resource created";
export const resourceNotFound = "resource not found";
export const resourceUpdated = "resource updated";
export const nothingDone = "Nothing done";
export const loggedIn = "logged in successfully";
export const couldnTAuthenticateRequest = "Couldn't authenticate request";
export const resourceFound = "resource found.";
export const DEFAULT_MSISDN = "msisdn";
export const UNTAGGED = "UNTAGGED";


// Numbers
export const pwdSaltRounds = 12;
export const TAKE_NUMBER = 50;

// Cookie Properties
export const cookieProps = Object.freeze({
    key: 'x-token',
    secret: process.env.COOKIE_SECRET,
    options: {
        httpOnly: true,
        signed: true,
        path: (process.env.COOKIE_PATH),
        maxAge: Number(process.env.COOKIE_EXP),
        domain: (process.env.COOKIE_DOMAIN),
        secure: (process.env.SECURE_COOKIE === 'true'),
    },
});
