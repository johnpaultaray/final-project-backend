import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
    templateUrl: 'layout.component.html',
    standalone: true,
    imports: [RouterOutlet]
})
export class LayoutComponent implements OnInit {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
    }
}