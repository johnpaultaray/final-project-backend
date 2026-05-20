import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
    templateUrl: 'details.component.html',
    standalone: true,
    imports: [CommonModule, RouterLink]
})
export class DetailsComponent {
    account$ = this.accountService.account$;

    constructor(private accountService: AccountService) { }
}
