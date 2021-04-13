import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinNotationPipe } from './pipes/coin-notation.pipe';
import { NumberToStringPipe } from './pipes/number-to-string.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { PasswordValidationDirective } from './directives/password-validation.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClipboardModule } from 'ngx-clipboard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GenericModalComponent } from './components/generic-modal/generic-modal.component';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';
import { ApiService } from '@shared/services/api.service';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletService } from '@shared/services/wallet.service';
import { StakingService } from '@shared/services/staking-service';
import { WalletInitializingComponent } from './components/wallet-initializing/wallet-initializing.component';
import { WalletInitializingFailedComponent } from './components/wallet-initializing-failed/wallet-initializing-failed.component';
import { LoggerService } from './services/logger.service';
import { ElectronService } from './services/electron.service';


@NgModule({
  imports: [CommonModule],
  declarations: [
    CoinNotationPipe,
    NumberToStringPipe,
    SecondsToStringPipe,
    AutoFocusDirective,
    PasswordValidationDirective,
    GenericModalComponent,
    LoadingModalComponent,
    ConfirmationModalComponent,
    WalletInitializingComponent,
    WalletInitializingFailedComponent
  ],
  providers : [
    ApiService,
    WalletService,
    SignalRService,
    StakingService,
    LoggerService,
    ElectronService
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgxQRCodeModule,
    NgxPaginationModule,
    ClipboardModule,
    GenericModalComponent,
    CoinNotationPipe,
    NumberToStringPipe,
    SecondsToStringPipe,
    AutoFocusDirective,
    PasswordValidationDirective,
    LoadingModalComponent,
    ConfirmationModalComponent,
    WalletInitializingComponent,
    WalletInitializingFailedComponent
  ]
})

export class SharedModule {
}
