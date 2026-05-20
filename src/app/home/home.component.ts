import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({ 
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: 'home.component.html' 
})
export class HomeComponent {
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService) { }
}