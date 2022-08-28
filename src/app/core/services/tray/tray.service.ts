import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { ExpresssvpnService } from '../expressvpn/expressvpn.service';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrayService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  tray: any;
  menu: any;

  private statusSubscription!: Subscription;

  private readonly favicons = {
    default: 'src/assets/icons/favicon.png',
    connected: 'src/assets/icons/favicon-connected.png',
    disconnected: 'src/assets/icons/favicon-disconnected.png',
    notactivated: 'src/assets/icons/favicon-notactivated.png',
    notinstalled: 'src/assets/icons/favicon-notinstalled.png',
  };

  private readonly currentFavicon$ = new BehaviorSubject<string>('');

  constructor(private readonly expressvpnService: ExpresssvpnService) {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.fs = window.require('fs');

      this.childProcess = window.require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      this.openTray();
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  private openTray(): void {
    const { Tray } = window.require('@electron/remote');
    const { Menu } = window.require('@electron/remote');
    this.tray = new Tray(this.favicons.default);
    this.currentFavicon$.next(this.favicons.default);
    this.menu = Menu.buildFromTemplate([
      {
        label: 'Item1',
        type: 'normal',
        click: () => this.handleTrayClick('item1'),
      },
      {
        label: 'Item2',
        type: 'normal',
        click: () => this.handleTrayClick('item2'),
      },
    ]);
    this.tray.setContextMenu(this.menu);
    this.openStatusSubscription();
  }

  private handleTrayClick = (item: string): void => {
    console.log('click', item);
  };

  private setTrayImage(imageUrl: string): void {
    this.tray.setImage(imageUrl);
  }

  private setCurrentFavicon(faviconUrl: string): void {
    this.currentFavicon$.next(faviconUrl);
  }

  private openStatusSubscription(): void {
    this.statusSubscription = combineLatest([
      this.currentFavicon$,
      this.expressvpnService.isConnected$,
      this.expressvpnService.isInstalled$,
      this.expressvpnService.isActivated$,
    ]).subscribe(([currentFavicon, isConnected, isInstalled, isActivated]) => {
      const favicons = this.favicons;

      if (!isInstalled && currentFavicon !== favicons.notinstalled) {
        this.setTrayImage(favicons.notinstalled);
        this.setCurrentFavicon(favicons.notinstalled);
      }

      if (
        isInstalled &&
        !isActivated &&
        currentFavicon !== favicons.notactivated
      ) {
        this.setTrayImage(favicons.notactivated);
        this.setCurrentFavicon(favicons.notactivated);
      }

      if (
        isInstalled &&
        isActivated &&
        isConnected &&
        currentFavicon !== favicons.connected
      ) {
        this.setTrayImage(favicons.connected);
        this.setCurrentFavicon(favicons.connected);
      }

      if (
        isInstalled &&
        isActivated &&
        !isConnected &&
        currentFavicon !== favicons.disconnected
      ) {
        this.setTrayImage(favicons.disconnected);
        this.setCurrentFavicon(favicons.disconnected);
      }
    });
  }
}
