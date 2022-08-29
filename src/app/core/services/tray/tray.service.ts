import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ExpresssvpnService } from '../expressvpn/expressvpn.service';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TrayService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  path: typeof path;
  tray: any;
  menu: any;

  private statusSubscription!: Subscription;

  private favicons!: { [key: string]: string };

  private readonly currentFavicon$ = new BehaviorSubject<string>('');

  constructor(
    private readonly expressvpnService: ExpresssvpnService,
    private readonly translateService: TranslateService
  ) {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.fs = window.require('fs');

      this.path = window.require('path');

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

      this.setTrayIcons();
      this.openTray();
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  private setTrayIcons(): void {
    this.favicons = {
      default: this.path.join('src', 'assets', 'icons', 'favicon.png'),
      connected: 'src/assets/icons/favicon-connected.png',
      disconnected: 'src/assets/icons/favicon-disconnected.png',
      notactivated: 'src/assets/icons/favicon-notactivated.png',
      notinstalled: 'src/assets/icons/favicon-notinstalled.png',
      disconnecting: 'src/assets/icons/favicon-disconnecting.png',
      connecting: 'src/assets/icons/favicon-connecting.png',
    };
  }

  private openTray(): void {
    const { Tray } = window.require('@electron/remote');
    const { Menu } = window.require('@electron/remote');
    this.tray = new Tray(this.favicons.default);
    this.currentFavicon$.next(this.favicons.default);
    this.menu = Menu.buildFromTemplate([]);
    this.tray.setContextMenu(this.menu);
    this.openStatusSubscription();
  }

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
      this.expressvpnService.isDisconnecting$,
      this.expressvpnService.isConnecting$,
      this.expressvpnService.connectedToMessage$,
    ]).subscribe(
      ([
        currentFavicon,
        isConnected,
        isInstalled,
        isActivated,
        isDisconnecting,
        isConnecting,
        connectedToMessage,
      ]) => {
        const favicons = this.favicons;

        if (!isInstalled && currentFavicon !== favicons.notinstalled) {
          this.setTrayImage(favicons.notinstalled);
          this.setCurrentFavicon(favicons.notinstalled);
          this.setNotInstalledMenu();
        }

        if (
          isInstalled &&
          !isActivated &&
          currentFavicon !== favicons.notactivated
        ) {
          this.setTrayImage(favicons.notactivated);
          this.setCurrentFavicon(favicons.notactivated);
          this.setNotActivatedMenu();
        }

        if (
          isInstalled &&
          isActivated &&
          isConnecting &&
          currentFavicon !== favicons.connecting
        ) {
          this.setTrayImage(favicons.connecting);
          this.setCurrentFavicon(favicons.connecting);
          this.setConnectingMenu();
        }

        if (
          isInstalled &&
          isActivated &&
          isDisconnecting &&
          currentFavicon !== favicons.disconnecting
        ) {
          this.setTrayImage(favicons.disconnecting);
          this.setCurrentFavicon(favicons.disconnecting);
          this.setDisconnectingMenu();
        }

        if (
          isInstalled &&
          isActivated &&
          isConnected &&
          !isConnecting &&
          !isDisconnecting &&
          currentFavicon !== favicons.connected
        ) {
          this.setTrayImage(favicons.connected);
          this.setCurrentFavicon(favicons.connected);
          this.setConnectedMenu(connectedToMessage);
        }

        if (
          isInstalled &&
          isActivated &&
          !isConnected &&
          !isConnecting &&
          !isDisconnecting &&
          currentFavicon !== favicons.disconnected
        ) {
          this.setTrayImage(favicons.disconnected);
          this.setCurrentFavicon(favicons.disconnected);
          this.setDisconnectedMenu();
        }
      }
    );
  }

  private setConnectedMenu(connectedToMessage: string): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: connectedToMessage,
        type: 'normal',
      },
      {
        type: 'separator',
      },
      {
        label: this.translateService.instant('disconnect'),
        type: 'normal',
        click: () => this.expressvpnService.disconnect(),
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }

  private setDisconnectedMenu(): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: this.translateService.instant('disconnected'),
        type: 'normal',
      },
      {
        type: 'separator',
      },
      {
        label: this.translateService.instant('quickConnect'),
        type: 'normal',
        click: () => this.expressvpnService.quickConnect(),
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }

  private setNotInstalledMenu(): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: this.translateService.instant('notInstalled'),
        type: 'normal',
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }

  private setNotActivatedMenu(): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: this.translateService.instant('notActivated'),
        type: 'normal',
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }

  private setConnectingMenu(): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: this.translateService.instant('connectingMessage'),
        type: 'normal',
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }

  private setDisconnectingMenu(): void {
    const { Menu } = window.require('@electron/remote');

    this.menu = Menu.buildFromTemplate([
      {
        label: this.translateService.instant('disconnectingMessage'),
        type: 'normal',
      },
    ]);

    this.tray.setContextMenu(this.menu);
  }
}
