import { AccountService } from '@app/_services/account.service';
import { catchError, of } from 'rxjs';

export function appInitializer(accountService: AccountService) {
    return () => accountService.refreshToken()
        .pipe(
            catchError(() => of())
        );
}