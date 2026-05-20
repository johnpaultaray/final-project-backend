import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/_helpers/auth.guard';
import { Role } from '@app/_models/role';
import { HomeComponent } from '@app/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { 
        path: 'account', 
        loadChildren: () => import('./account/account.module').then(x => x.AccountModule) 
    },
    { 
        path: 'profile', 
        loadChildren: () => import('./profile/profile.module').then(x => x.ProfileModule),
        canActivate: [AuthGuard]
    },
    { 
        path: 'admin', 
        loadChildren: () => import('./admin/admin.module').then(x => x.AdminModule),
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }