import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import {
  Observable,
  from,
  map,
  catchError,
  of,
  timer,
  switchMap,
  BehaviorSubject,
  take,
  Subscription,
  combineLatest,
} from 'rxjs';
import { COMMANDS, SETTINGS, STRINGS } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class ExpresssvpnService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  exec: any;

  private readonly _connectedToMessage$ = new BehaviorSubject<string>('');
  private readonly _isConnecting$ = new BehaviorSubject<boolean>(false);
  private readonly _isDisconnecting$ = new BehaviorSubject<boolean>(false);
  private readonly _statusPolling$ = timer(0, SETTINGS.statusPollingMs).pipe(
    switchMap(() => from(this.exec(COMMANDS.getStatus)))
  );
  private readonly _version$ = new BehaviorSubject<string>('');

  private isConnectedSubscription!: Subscription;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.fs = window.require('fs');
      this.childProcess = window.require('child_process');
      this.exec = util.promisify(window.require('child_process').exec);
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  get connectedToMessage$(): Observable<string> {
    return this._connectedToMessage$.asObservable();
  }

  get isConnecting$(): Observable<boolean> {
    return this._isConnecting$.asObservable();
  }

  get isDisconnecting$(): Observable<boolean> {
    return this._isDisconnecting$.asObservable();
  }

  get isInstalled$(): Observable<boolean> {
    return timer(0, SETTINGS.isInstalledPollingMs).pipe(
      switchMap(() =>
        from(this.exec(COMMANDS.isInstalled)).pipe(
          map((message) => {
            if (this.toPlainString(message).includes(STRINGS.isInstalled)) {
              return true;
            }
            return false;
          }),
          catchError(() => of(false))
        )
      )
    );
  }

  get isActivated$(): Observable<boolean> {
    return this._statusPolling$.pipe(
      map((message) => {
        const version = this._version$.getValue();

        if (this.toPlainString(message).includes(STRINGS.notActivated)) {
          this.clearVersion();
          return false;
        }

        if (!version) {
          this.setVersion();
        }

        return true;
      }),
      catchError(() => of(false))
    );
  }

  get isConnected$(): Observable<boolean> {
    return this._statusPolling$.pipe(
      map((message) => {
        const plainMessage = this.toPlainString(message);
        const connectedToMessage = this._connectedToMessage$.getValue();

        if (plainMessage.includes(STRINGS.notConnected)) {
          this._isDisconnecting$.next(false);
          if (connectedToMessage) {
            this.clearConnectToMessage();
          }

          return false;
        } else if (plainMessage.includes(STRINGS.connected)) {
          this._isConnecting$.next(false);
          if (!connectedToMessage) {
            this.setConnectedToMessage(`${message}`);
          }
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  get version$(): Observable<string> {
    return this._version$.asObservable();
  }

  quickConnect(): void {
    this._isConnecting$.next(true);

    this.childProcess.exec(COMMANDS.connect, (error, stdout, stderr) => {
      if (error || stderr) {
        this._isConnecting$.next(false);
      }
    });
  }

  connectToLocation(locationString: string): void {
    this.isConnectedSubscription = combineLatest([
      this.isConnected$,
      this.isDisconnecting$,
    ]).subscribe(([isConnected, isDisconnecting]) => {
      if (isConnected && !isDisconnecting) {
        this.disconnect();
      } else if (!isConnected && !isDisconnecting) {
        this.isConnectedSubscription?.unsubscribe();

        setTimeout(() => {
          this.childProcess.exec(
            `${COMMANDS.connect} "${locationString}"`,
            (error, stdout, stderr) => {
              if (error || stderr) {
                this._isConnecting$.next(false);
              }
            }
          );
        }, 500);

        this._isConnecting$.next(true);
      }
    });
  }

  disconnect(): void {
    this._isDisconnecting$.next(true);

    this.childProcess.exec(COMMANDS.disconnect, (error, stdout, stderr) => {
      if (error || stderr) {
        this._isDisconnecting$.next(false);
      }
    });
  }

  private toPlainString(text: any): string {
    return text?.toLowerCase().replace(/\s/g, '') || '';
  }

  private setConnectedToMessage(message: string): void {
    const startIndex = message.indexOf('Con');
    const startMessage = message.substring(startIndex, message.length);
    const endIndex = startMessage.indexOf('');
    const finalMessage = startMessage.substring(0, endIndex).trim();

    this._connectedToMessage$.pipe(take(1)).subscribe((connectedToMessage) => {
      if (connectedToMessage !== finalMessage) {
        this._connectedToMessage$.next(finalMessage);
      }
    });
  }

  private clearConnectToMessage(): void {
    this._connectedToMessage$.next('');
  }

  private setVersion(): void {
    this.childProcess.exec(COMMANDS.version, (error, stdout, stderr) => {
      const version = `${stdout}`;
      this._version$.next(version.trim());
    });
  }

  private clearVersion(): void {
    this._version$.next('');
  }
}
