import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Account } from '@app/_models/account';
import { AccountService } from '@app/_services/account.service';

@Component({
    templateUrl: 'subnav.component.html',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SubnavComponent implements OnInit, OnDestroy {
    account: Account | null = null;
    private subscription: Subscription;

    constructor(private accountService: AccountService) {
        this.subscription = this.accountService.account$.subscribe(x => this.account = x);
    }

    ngOnInit() { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}