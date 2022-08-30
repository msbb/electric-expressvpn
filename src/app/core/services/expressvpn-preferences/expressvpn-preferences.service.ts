import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import { Observable, from, BehaviorSubject, take, tap } from 'rxjs';
import { COMMANDS } from '../../constants';
import { ExpressvpnPreferences } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ExpresssvpnPreferencesService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  exec: any;

  private readonly _preferencesDisabled$ = new BehaviorSubject<boolean>(false);
  private readonly _expressvpnPreferences$ = new BehaviorSubject<
    ExpressvpnPreferences | undefined
  >(undefined);

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

  get preferencesDisabled$(): Observable<boolean> {
    return this._preferencesDisabled$.asObservable();
  }

  get expressvpnPreferences$(): Observable<ExpressvpnPreferences> {
    return this._expressvpnPreferences$.asObservable();
  }

  setPreference(preference: string, value: string): void {
    this._preferencesDisabled$.next(true);

    this.childProcess.exec(
      `${COMMANDS.setPreference} ${preference} ${value}`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          this._preferencesDisabled$.next(false);
        } else if (stdout) {
          this._preferencesDisabled$.next(false);
          this.refreshPreferences();
        }
      }
    );
  }

  refreshPreferences(): void {
    from(this.exec(COMMANDS.preferences))
      .pipe(
        take(1),
        tap((preferences) => {
          const consoleMessage = (preferences as any)?.stdout || preferences;
          const preferencesMessage = `${consoleMessage}`;
          if (preferencesMessage) {
            const preferencesToReturn = [];
            const splitPreferences: Array<string> = preferencesMessage
              .replace(/\t/gi, ' ')
              .replace(/\n/gi, ' ')
              .split(' ')
              .filter((value) => !!value);

            splitPreferences.forEach((pString, index) => {
              if (index % 2 === 0) {
                preferencesToReturn.push({ preference: pString });
              } else {
                preferencesToReturn[preferencesToReturn.length - 1].value =
                  pString;
              }
            });

            return this._expressvpnPreferences$.next(preferencesToReturn);
          } else {
            return this._expressvpnPreferences$.next(undefined);
          }
        })
      )
      .subscribe();
  }
}
