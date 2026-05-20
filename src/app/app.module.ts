import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from '@app/_components/alert.component';
import { HomeComponent } from '@app/home/home.component';
import { JwtInterceptor } from '@app/_helpers/jwt.interceptor';
import { ErrorInterceptor } from '@app/_helpers/error.interceptor';
import { appInitializer } from '@app/_helpers/app.initializer';
import { AccountService } from '@app/_services/account.service';
import { fakeBackendProvider } from '@app/_helpers/fake-backend';
import { environment } from '@environments/environment';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        AppComponent,
        AlertComponent,
        HomeComponent
    ],
    declarations: [
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // ...(environment.production ? [] : [fakeBackendProvider])
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }