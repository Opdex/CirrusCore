import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from '@shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiInterceptor } from '@shared/http-interceptors/api-interceptor';
import { LoginComponent } from './login/login.component';
import { SetupModule } from './setup/setup.module';
import { WalletModule } from './wallet/wallet.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AuthenticationService } from './shared/services/auth.service';
import { AuthenticationGuard } from './shared/guards/auth.guard';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    SetupModule,
    WalletModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    LoginComponent
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true}, AuthenticationService, AuthenticationGuard ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
