import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Account } from '@app/_models/account';
import { AccountService } from '@app/_services/account.service';
import { AlertComponent } from '@app/_components/alert.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, AlertComponent]
})
export class AppComponent implements OnDestroy {
    account: Account | null = null;
    private subscription: Subscription;

    constructor(private accountService: AccountService) {
        this.subscription = this.accountService.account$.subscribe(x => this.account = x);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    logout() {
        this.accountService.logout();
    }
}