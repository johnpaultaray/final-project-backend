import config from '../config.json';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import sendEmail from '../_helpers/send-email';
import db from '../_helpers/db';
import Role from '../_helpers/role';

/* =========================
   CONSTANTS
========================= */
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://final-project-frontend-eo6a.onrender.com';

/* =========================
   EXPORT SERVICE OBJECT
========================= */
const accountService = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

export default accountService;

/* =========================
   AUTH
========================= */
async function authenticate({ email, password, ipAddress }: any) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (
        !account ||
        !account.isVerified ||
        !(await bcrypt.compare(password, account.passwordHash))
    ) {
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    await refreshToken.save();

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

/* =========================
   REFRESH TOKEN
========================= */
async function refreshToken(req: any) {
    const token = req.cookies.refreshToken;

    if (!token) throw 'Refresh token missing';

    const refresh = await getRefreshToken(token);
    const account = await refresh.getAccount();

    const newRefresh = generateRefreshToken(account, req.ip);

    refresh.revoked = Date.now();
    refresh.revokedByIp = req.ip;
    refresh.replacedByToken = newRefresh.token;

    await refresh.save();
    await newRefresh.save();

    const jwtToken = generateJwtToken(account);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefresh.token
    };
}

/* =========================
   REVOKE TOKEN
========================= */
async function revokeToken({ token, ipAddress }: any) {
    const refresh = await getRefreshToken(token);

    refresh.revoked = Date.now();
    refresh.revokedByIp = ipAddress;

    await refresh.save();
}

/* =========================
   REGISTER
========================= */
async function register(params: any, origin: any) {
    if (await db.Account.findOne({ where: { email: params.email } })) {
        return sendAlreadyRegisteredEmail(params.email, origin);
    }

    const account = new db.Account(params);

    const isFirst = (await db.Account.count()) === 0;
    account.role = isFirst ? Role.Admin : Role.User;

    account.verificationToken = randomTokenString();
    account.passwordHash = await hash(params.password);

    await account.save();

    await sendVerificationEmail(account);
}

/* =========================
   VERIFY EMAIL
========================= */
async function verifyEmail({ token }: any) {
    const account = await db.Account.findOne({
        where: { verificationToken: token }
    });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;

    await account.save();
}

/* =========================
   FORGOT PASSWORD
========================= */
async function forgotPassword({ email }: any, origin: any) {
    const account = await db.Account.findOne({ where: { email } });

    if (!account) return;

    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await account.save();

    await sendPasswordResetEmail(account);
}

/* =========================
   RESET TOKEN VALIDATION
========================= */
async function validateResetToken(params: any) {
    const token = typeof params === 'string' ? params : params?.token;

    if (!token) return { valid: false };

    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: new Date() }
        }
    });

    return { valid: !!account };
}

/* =========================
   RESET PASSWORD
========================= */
async function resetPassword({ token, password }: any) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: new Date() }
        }
    });

    if (!account) throw 'Invalid or expired token';

    account.passwordHash = await hash(password);
    account.resetToken = null;
    account.resetTokenExpires = null;
    account.passwordReset = Date.now();

    await account.save();

    return { success: true };
}

/* =========================
   CRUD
========================= */
async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map((x: any) => basicDetails(x));
}

async function getById(id: any) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params: any) {
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw `Email ${params.email} is already registered`;
    }

    const account = new db.Account(params);
    account.verified = Date.now();
    account.passwordHash = await hash(params.password);

    await account.save();

    return basicDetails(account);
}

async function update(id: any, params: any) {
    const account = await getAccount(id);

    if (
        params.email &&
        params.email !== account.email &&
        await db.Account.findOne({ where: { email: params.email } })
    ) {
        throw `Email ${params.email} is already taken`;
    }

    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    Object.assign(account, params);
    account.updated = Date.now();

    await account.save();

    return basicDetails(account);
}

async function _delete(id: any) {
    const account = await getAccount(id);
    await account.destroy();
}

/* =========================
   HELPERS
========================= */
async function getAccount(id: any) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token: any) {
    const refresh = await db.RefreshToken.findOne({ where: { token } });

    if (!refresh || !refresh.isActive) throw 'Invalid token';

    return refresh;
}

async function hash(password: string) {
    return bcrypt.hash(password, 10);
}

function generateJwtToken(account: any) {
    return jwt.sign(
        { sub: account.id, id: account.id },
        config.secret,
        { expiresIn: '15m' }
    );
}

function generateRefreshToken(account: any, ip: string) {
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ip
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account: any) {
    const {
        id,
        title,
        firstName,
        lastName,
        email,
        role,
        created,
        updated,
        isVerified
    } = account;

    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}

/* =========================
   EMAILS
========================= */
async function sendVerificationEmail(account: any) {
    const verifyUrl = FRONTEND_URL + '/account/verify-email?token=' + account.verificationToken;

    await sendEmail({
        to: account.email,
        subject: 'Verify Email',
        html: '<p>Please click the link below to verify your email:</p><a href="' + verifyUrl + '">' + verifyUrl + '</a>'
    });
}

async function sendAlreadyRegisteredEmail(email: string, origin: any) {
    await sendEmail({
        to: email,
        subject: 'Already Registered',
        html: '<p>This email is already registered.</p>'
    });
}

async function sendPasswordResetEmail(account: any) {
    const resetUrl = FRONTEND_URL + '/account/reset-password?token=' + account.resetToken;

    await sendEmail({
        to: account.email,
        subject: 'Reset Password',
        html: '<p>Please click the link below to reset your password:</p><a href="' + resetUrl + '">' + resetUrl + '</a>'
    });
}