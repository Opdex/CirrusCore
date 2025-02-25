import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interval, Observable } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { GlobalService } from './global.service';
import { AddressLabel } from '../models/address-label';
import { WalletCreation } from '../models/wallet-creation';
import { WalletRecovery } from '../models/wallet-recovery';
import { WalletLoad } from '../models/wallet-load';
import { WalletInfo, WalletInfoRequest } from '../models/wallet-info';
import { NodeStatus } from '../models/node-status';
import { LocalExecutionResult } from '@shared/models/local-execution-result';
import { TokenBalanceRequest } from '../../wallet/tokens/models/token-balance-request';
import { RestApi } from '@shared/services/rest-api';
import { IApiService } from '@shared/services/interfaces/services.i';
import { ErrorService } from '@shared/services/error-service';
import { LoggerService } from '@shared/services/logger.service';
import { getHttpOptions } from './rest-api';
import { Token } from '../../wallet/tokens/models/token';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends RestApi implements IApiService {
  private pollingInterval = interval(5000);

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    errorService: ErrorService,
    loggerService: LoggerService) {
    super(globalService, http, errorService, loggerService);
  }

  public getNodeStatus(silent: boolean): Observable<NodeStatus> {
    const url = 'node/status?publish=true';

    return this.get<NodeStatus>(url).pipe(catchError(err => this.handleHttpError(err, silent)));
  }

  public getNodeStatusInterval(silent?: boolean): Observable<NodeStatus> {
    return this.pollingInterval.pipe(
      startWith(0),
      switchMap(() => this.get<NodeStatus>('node/status')),
      catchError(err => this.handleHttpError(err, silent)));
  }

  public getAddressBookAddresses(): Observable<any> {
    return this.get('addressBook').pipe(
      catchError(err => this.handleHttpError(err)));
  }

  public addAddressBookAddress(data: AddressLabel): Observable<any> {
    return this.post('addressBook/address', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public removeAddressBookAddress(label: string): Observable<any> {
    const params = new HttpParams().set('label', label);
    return this.delete('addressBook/address', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Gets the extended public key from a certain wallet */
  public getExtPubkey(data: WalletInfo): Observable<any> {
    return this.get('wallet/extpubkey', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get a new mnemonic
   */
  public getNewMnemonic(): Observable<any> {
    const params = new HttpParams()
      .set('language', 'English')
      .set('wordCount', '12');

    return this.get('wallet/mnemonic', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Create a new Stratis wallet.
   */
  public createStratisWallet(data: WalletCreation): Observable<any> {
    return this.post('wallet/create/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Recover a Stratis wallet.
   */
  public recoverStratisWallet(data: WalletRecovery): Observable<any> {
    return this.post('wallet/recover/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Load a Stratis wallet
   */
  public loadStratisWallet(data: WalletLoad): Observable<any> {
    return this.post('wallet/load/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get wallet status info from the API.
   */
  public getWalletStatus(): Observable<any> {
    return this.get('wallet/status').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get general wallet info from the API once.
   */
  public getGeneralInfoOnce(data: WalletInfo): Observable<any> {
    const params = new HttpParams().set('Name', data.walletName);
    return this.get('wallet/general-info', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Get the maximum sendable amount for a given fee from the API
   */
  public getMaximumBalance(data: WalletInfoRequest): Observable<any> {
    return this.get('wallet/maxbalance',
      this.getWalletParams(data, {
        feeType: data.feeType,
        allowUnconfirmed: 'true'
      })).pipe(
        catchError(err => this.handleHttpError(err))
      );
  }

  /**
   * Get multiple unused receive addresses for a certain wallet from the API.
   */
  public getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
    return this.get('wallet/unusedaddresses', this.getWalletParams(data, { count })).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Remove transaction */
  public removeTransaction(walletName: string): Observable<any> {
    const params = new HttpParams()
      .set('walletName', walletName)
      .set('all', 'true')
      .set('resync', 'true');
    return this.delete('wallet/remove-transactions', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Sign Message */
  public signMessage(request: any): Observable<string> {
    return this.post('wallet/signmessage', request).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /**
   * Send shutdown signal to the daemon
   */
  public shutdownNode(): Observable<any> {
    return this.post('node/shutdown', 'corsProtection:true').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the active smart contract wallet address.
    */
  public getAccountAddress(walletName: string): Observable<any> {
    const params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-address', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getAccountAddresses(walletName: string): any {
    const params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-addresses', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the balance of the active smart contract address.
    */
  public getAccountBalance(walletName: string): Observable<any> {
    const params = new HttpParams().set('walletName', walletName);
    return this.get('smartcontractwallet/account-balance', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Get the balance of the active smart contract address.
    */
  public getAddressBalance(address: string): Observable<any> {
    const params = new HttpParams().set('address', address);
    return this.get('smartcontractwallet/address-balance', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Posts a contract creation transaction
    */
  public postCreateTransaction(transaction: any): Observable<any> {
    return this.post('smartcontractwallet/create', transaction).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  /*
    * Posts a contract call transaction
    */
  public postCallTransaction(transaction: any): Observable<any> {
    return this.post('smartcontractwallet/call', transaction).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getReceipt(hash: string, silent = false): any {
    const params = new HttpParams().set('txHash', hash);
    return this.get('smartcontracts/receipt', params).pipe(
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  /*
    Setting the silent flag is not enough because the error format returned by /receipt still causes a modal to be displayed.
  */
  public getReceiptSilent(hash: string): any {
    const params = new HttpParams().set('txHash', hash);
    return this.get('smartcontracts/receipt', params);
  }

  public localCall(localCall: TokenBalanceRequest): Observable<LocalExecutionResult> {
    return this.post<LocalExecutionResult>('smartcontracts/local-call', localCall).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  // Returns local call data as raw text so we can parse it correctly later
  public localCallRaw(localCall: TokenBalanceRequest): Observable<string> {
    return this.httpClient.post(`${this.API_URL}/smartcontracts/local-call`, localCall, {
      ...getHttpOptions('application/json', 'application/json'),
      responseType: 'text'
    }).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: string }): HttpParams {
    let params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', `account ${walletInfo.account || 0}`);

    if (extra) {
      Object.keys(extra).forEach(key => params = params.set(key, extra[key]));
    }

    return params;
  }

  public supportedInterFluxTokens(): Observable<any[]> {
    const params = new HttpParams().set('networkType', this.globalService.getTestnetEnabled() ? '1' : '0');
    return this.get('SupportedContracts/list', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }
}