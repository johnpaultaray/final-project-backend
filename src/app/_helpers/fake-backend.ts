import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';
import { Account, Role } from '@app/_models/account';
import { AlertService } from '@app/_services/alert.service';

/*
const accountsKey = 'angular-21-auth-accounts';
const currentAccountIdKey = 'angular-21-auth-current-account-id';
let accounts: Account[] = JSON.parse(localStorage.getItem(accountsKey)!) || [];

function getCurrentAccount(): Account | null {
    const id = localStorage.getItem(currentAccountIdKey);
    if (!id) return null;
    return accounts.find(x => x.id === id) || null;
}

function setCurrentAccount(account: Account | null) {
    if (account) {
        localStorage.setItem(currentAccountIdKey, account.id);
    } else {
        localStorage.removeItem(currentAccountIdKey);
    }
}
*/

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request);
        /*
        const { url, method, headers, body } = request;

        const handleRoute = (request: HttpRequest<any>): Observable<HttpEvent<any>> => {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAll();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getById();
                case url.endsWith('/accounts') && method === 'POST':
                    return create();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return update();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                default:
                    return next.handle(request);
            }
        }

        const authenticate = () => {
            const { email, password } = body;
            const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);

            if (!account) return error('Email or password is incorrect');

            account.jwtToken = generateJwtToken(account);
            setCurrentAccount(account);
            return ok(account);
        }

        const refreshToken = () => {
            const account = getCurrentAccount();
            if (account) {
                account.jwtToken = generateJwtToken(account);
                return ok(account);
            }
            return error('Refresh token invalid');
        }

        const revokeToken = () => {
            setCurrentAccount(null);
            return ok({});
        }

        const register = () => {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                return error('Email "' + account.email + '" is already registered');
            }

            account.id = String(accounts.length + 1);
            account.role = accounts.length === 0 ? Role.Admin : Role.User;
            account.isVerified = false;
            delete account.confirmPassword;

            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            this.alertService.info(`
                <h4>Verification Email</h4>
                <p>Hi ${account.firstName},</p>
                <p>Please click the below link to verify your email address:</p>
                <p><a href="/account/verify-email?token=verify-${account.id}">Verify Email</a></p>
            `, { autoClose: false, keepAfterRouteChange: true });

            return ok({});
        }

        const verifyEmail = () => {
            const { token } = body;
            const id = parseInt(token.split('-')[1]);
            const account = accounts.find(x => x.id === String(id));

            if (!account) return error('Verification failed');

            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({});
        }

        const forgotPassword = () => {
            const { email } = body;
            const account = accounts.find(x => x.email === email);

            if (account) {
                account.resetToken = `reset-${account.id}`;
                localStorage.setItem(accountsKey, JSON.stringify(accounts));

                this.alertService.info(`
                    <h4>Password Reset Email</h4>
                    <p>Hi ${account.firstName},</p>
                    <p>Please click the below link to reset your password:</p>
                    <p><a href="/account/reset-password?token=${account.resetToken}">Reset Password</a></p>
                `, { autoClose: false, keepAfterRouteChange: true });
            }

            return ok({});
        }

        const validateResetToken = () => {
            const { token } = body;
            const account = accounts.find(x => x.resetToken === token);

            if (!account) return error('Invalid token');

            return ok({});
        }

        const resetPassword = () => {
            const { token, password } = body;
            const account = accounts.find(x => x.resetToken === token);

            if (!account) return error('Invalid token');

            account.password = password;
            delete account.resetToken;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({});
        }

        const getAll = () => {
            return ok(accounts);
        }

        const getById = () => {
            const account = accounts.find(x => x.id === String(idFromUrl()));
            return ok(account);
        }

        const create = () => {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                return error('Email "' + account.email + '" is already registered');
            }

            account.id = String(accounts.length + 1);
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({});
        }

        const update = () => {
            const params = body;
            const account = accounts.find(x => x.id === String(idFromUrl()));

            if (params.email && account?.email !== params.email && accounts.find(x => x.email === params.email)) {
                return error('Email "' + params.email + '" is already registered');
            }

            if (!account) return error('Account not found');

            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({});
        }

        const deleteAccount = () => {
            accounts = accounts.filter(x => x.id !== String(idFromUrl()));
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok({});
        }

        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500));
        }

        function error(message: string) {
            return throwError(() => ({ error: { message } }))
                .pipe(materialize(), delay(500), dematerialize());
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function generateJwtToken(account: Account) {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                exp: Math.floor(Date.now() / 1000) + (15 * 60),
                id: account.id,
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                role: account.role
            }));
            const signature = btoa('fake-signature');
            return `${header}.${payload}.${signature}`;
        }

        return handleRoute(request);
        */
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};