import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
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
  private readonly _statusPolling$ = timer(0, SETTINGS.STATUS_POLLING_MS).pipe(
    switchMap(() => from(this.exec(COMMANDS.GET_STATUS)))
  );

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
    return timer(0, SETTINGS.IS_INSTALLED_POLLING_MS).pipe(
      switchMap(() =>
        from(this.exec(COMMANDS.IS_INSTALLED)).pipe(
          map((message) => {
            if (this.toPlainString(message).includes(STRINGS.IS_INSTALLED)) {
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
        if (this.toPlainString(message).includes(STRINGS.NOT_ACTIVATED)) {
          return false;
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

        if (plainMessage.includes(STRINGS.NOT_CONNECTED)) {
          this._isDisconnecting$.next(false);
          if (connectedToMessage) {
            this.clearConnectToMessage();
          }

          return false;
        } else if (plainMessage.includes(STRINGS.CONNECTED)) {
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

  smartConnect(): void {
    this._isConnecting$.next(true);

    this.childProcess.exec(COMMANDS.SMART_CONNECT, (error, stdout, stderr) => {
      if (error || stderr) {
        this._isConnecting$.next(false);
      }
    });
  }

  disconnect(): void {
    this._isDisconnecting$.next(true);

    this.childProcess.exec(COMMANDS.DISCONNECT, (error, stdout, stderr) => {
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

    this._connectedToMessage$.pipe(take(1)).subscribe((message) => {
      if (message !== finalMessage) {
        this._connectedToMessage$.next(finalMessage);
      }
    });
  }

  private clearConnectToMessage(): void {
    this._connectedToMessage$.next('');
  }
}
