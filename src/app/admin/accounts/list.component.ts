import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Account } from '@app/_models/account';
import { AccountService } from '@app/_services/account.service';

@Component({
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ]
})
export class ListComponent implements OnInit {
    accounts?: Account[];

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.accountService.getAll()
            .subscribe(accounts => this.accounts = accounts);
    }

    deleteAccount(id: string) {
        const account = this.accounts!.find(x => x.id === id);
        if (account) {
            (account as any).isDeleting = true;
            this.accountService.delete(id)
                .subscribe(() => {
                    this.accounts = this.accounts!.filter(x => x.id !== id)
                });
        }
    }
}