import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
import { Role } from '@app/_models/role';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { MustMatch } from '@app/_helpers/must-match.validator';

@Component({
    templateUrl: 'add-edit.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink
    ]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validators: MustMatch('password', 'confirmPassword')
        });

        this.title = 'Add Account';
        if (this.id) {
            this.title = 'Edit Account';
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.f['password'].clearValidators();
                    this.f['password'].updateValueAndValidity();
                });
        } else {
            this.f['password'].addValidators(Validators.required);
        }
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.id) {
            this.accountService.update(this.id, this.form.value)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Account updated successfully', { keepAfterRouteChange: true });
                        this.router.navigate(['/admin/accounts']);
                    },
                    error: (error: any) => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        } else {
            this.accountService.create(this.form.value)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
                        this.router.navigate(['/admin/accounts']);
                    },
                    error: (error: any) => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        }
    }
}