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

@Injectable({
  providedIn: 'root',
})
export class ExpresssvpnService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  exec: any;

  private readonly IS_INSTALLED_POLLING_MS = 2000;
  private readonly STATUS_POLLING_MS = 1000;

  private readonly IS_INSTALLED_COMMAND = 'expressvpn';
  private readonly STATUS_COMMAND = 'expressvpn status';
  private readonly SMART_CONNECT_COMMAND = 'expressvpn connect';
  private readonly DISCONNECT_COMMAND = 'expressvpn disconnect';

  private readonly IS_INSTALLED_STRING = 'expressvpn';
  private readonly NOT_ACTIVATED_STRING = 'notactivated';
  private readonly NOT_CONNECTED_STRING = 'notconnected';
  private readonly CONNECTED_STRING = 'connectedto';

  private readonly _connectedToMessage$ = new BehaviorSubject<string>('');
  private readonly _isConnecting$ = new BehaviorSubject<boolean>(false);
  private readonly _isDisconnecting$ = new BehaviorSubject<boolean>(false);
  private readonly _statusPolling$ = timer(0, this.STATUS_POLLING_MS).pipe(
    switchMap(() => from(this.exec(this.STATUS_COMMAND)))
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
    return timer(0, this.IS_INSTALLED_POLLING_MS).pipe(
      switchMap(() =>
        from(this.exec(this.IS_INSTALLED_COMMAND)).pipe(
          map((message) => {
            if (
              this.toPlainString(message).includes(this.IS_INSTALLED_STRING)
            ) {
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
        if (this.toPlainString(message).includes(this.NOT_ACTIVATED_STRING)) {
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

        if (plainMessage.includes(this.NOT_CONNECTED_STRING)) {
          this._isDisconnecting$.next(false);
          if (connectedToMessage) {
            this.clearConnectToMessage();
          }

          return false;
        } else if (plainMessage.includes(this.CONNECTED_STRING)) {
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

    this.childProcess.exec(
      this.SMART_CONNECT_COMMAND,
      (error, stdout, stderr) => {
        if (error || stderr) {
          this._isConnecting$.next(false);
        }
      }
    );
  }

  disconnect(): void {
    this._isDisconnecting$.next(true);

    this.childProcess.exec(this.DISCONNECT_COMMAND, (error, stdout, stderr) => {
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
