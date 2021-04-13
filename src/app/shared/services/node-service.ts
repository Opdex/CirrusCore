import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletInfo } from '@shared/models/wallet-info';
import {
  GeneralInfo,
  FullNodeEventModel
} from '@shared/services/interfaces/api.i';
import {
  BlockConnectedSignalREvent,
  SignalREvents,
  WalletInfoSignalREvent,
  FullNodeEvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';
import { LoggerService } from '@shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class NodeService extends RestApi {
  private fullNodeEventSubject: BehaviorSubject<FullNodeEventModel> = new BehaviorSubject<FullNodeEventModel>({message: "Initializing...", state: ""});

  private generalInfoSubject: BehaviorSubject<GeneralInfo> = new BehaviorSubject<GeneralInfo>({
    walletName: '',
    walletFilePath: '',
    network: '',
    creationTime: '',
    isDecrypted: false,
    lastBlockSyncedHeight: 0,
    chainTip: 0,
    isChainSynced: false,
    connectedNodes: 0
  });

  private currentWallet: WalletInfo;
  private lastBlockTimestamp: number;
  private calculatedChainTip: number;

  constructor(
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    signalRService: SignalRService,
    loggerService: LoggerService) {
    super(globalService, http, errorService, loggerService);

    globalService.currentWallet.subscribe(wallet => {
      if (wallet) {
        this.currentWallet = wallet;
        this.updateGeneralInfoForCurrentWallet();
      }
    });

    signalRService.registerOnMessageEventHandler<FullNodeEvent>(
      SignalREvents.FullNodeEvent, (message) => {
        this.fullNodeEventSubject.next(message);
      });

    signalRService.registerOnMessageEventHandler<WalletInfoSignalREvent>(
      SignalREvents.WalletGeneralInfo, (message) => {
        if (this.currentWallet && message.walletName === this.currentWallet.walletName) {
          this.applyChainTip(message);
          this.applyPercentSynced(message);
          this.generalInfoSubject.next(message);
        }
      });

    // Update the GeneralInfo Subject when a new block is connected
    // This feels a little weak as we could un-sync? + Other properties we don't update
    // So maybe we should just get all the data once in a while?
    signalRService.registerOnMessageEventHandler<BlockConnectedSignalREvent>(SignalREvents.BlockConnected,
                                                                             (message) => {
                                                                               const generalInfo = this.generalInfoSubject.value;
                                                                               if (generalInfo.isChainSynced) {
                                                                                 if (generalInfo.chainTip < message.height) {
                                                                                   this.patchAndUpdateGeneralInfo({
                                                                                     chainTip: message.height,
                                                                                     lastBlockSyncedHeight: message.height
                                                                                   });
                                                                                 }
                                                                               }
                                                                             });
  }

  public generalInfo(): Observable<GeneralInfo> {
    return this.generalInfoSubject.asObservable();
  }

  public FullNodeEvent(): Observable<FullNodeEventModel> {
    return this.fullNodeEventSubject.asObservable();
  }

  public addNode(nodeIP: string): Observable<any> {
    const params = new HttpParams()
      .set('endpoint', nodeIP)
      .set('command', 'add');

    return this.get('connectionmanager/addnode', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }


  private updateGeneralInfoForCurrentWallet(): void {
    if (this.currentWallet) {
      const params = new HttpParams().set('Name', this.currentWallet.walletName);
      this.get<GeneralInfo>('wallet/general-info', params).pipe(
        catchError(err => this.handleHttpError(err)))
        .toPromise().then(generalInfo => {
          this.applyChainTip(generalInfo);
          this.applyPercentSynced(generalInfo);
          this.generalInfoSubject.next(generalInfo);
        });
    }
  }

  private applyChainTip(message: GeneralInfo): void {
    if (!message.isChainSynced && !this.calculatedChainTip) {
      this.getBlockHash(message.lastBlockSyncedHeight).toPromise().then(response=> {
        this.getBlockInfo(response).toPromise().then(response => {
          if (response) {
            this.lastBlockTimestamp = response.time;
          }
        });
      });

      const timeLeft: number = Date.now()/1000 - this.lastBlockTimestamp;
      const blocksLeft: number = timeLeft / 45;
      this.calculatedChainTip = (message.lastBlockSyncedHeight + blocksLeft) | 0;
      message.chainTip = this.calculatedChainTip;
    } else if (!message.isChainSynced && this.calculatedChainTip) {
      message.chainTip = this.calculatedChainTip;
    }
  }

  private applyPercentSynced(message: GeneralInfo): void {

    // If ChainTip is behind wallet stop sync percent being greater than 100%.
    let percentSynced = Math.min((message.lastBlockSyncedHeight / message.chainTip) * 100, 100);
    if (percentSynced.toFixed(0) === '100' && message.lastBlockSyncedHeight !== message.chainTip) {
      percentSynced = 99;
    }
    message.percentSynced = percentSynced;
  }

  public getBlockHash(height: number): Observable<any> {
    const params = new HttpParams()
      .set('height', height.toString());

    return this.get('consensus/getblockhash', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getBlockInfo(hash: string): Observable<any> {
    const params = new HttpParams()
      .set('hash', hash)
      .set('outputJson', 'true');

    return this.get('blockstore/block', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private patchAndUpdateGeneralInfo(patch: any): void {
    const updatedGeneralInfo = {} as GeneralInfo;

    Object.assign(updatedGeneralInfo, this.generalInfoSubject.value);
    Object.assign(updatedGeneralInfo, patch);

    this.generalInfoSubject.next(updatedGeneralInfo);
  }
}
