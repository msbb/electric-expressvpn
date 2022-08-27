import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, combineLatest, Observable, take } from 'rxjs';
import {
  CountryWithLocations,
  ExpressvpnLocation,
  LocationsSortedByCountry,
  NetworkLock,
} from '../../../core/models';
import {
  ExpresssvpnLocationsService,
  ExpresssvpnService,
} from '../../../core/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  @ViewChild('settingsDialog', { static: true })
  settingsDialog: TemplateRef<any>;

  readonly isInstalled$: Observable<boolean> =
    this.expressvpnService.isInstalled$;
  readonly isActivated$: Observable<boolean> =
    this.expressvpnService.isActivated$;
  readonly isConnected$: Observable<boolean> =
    this.expressvpnService.isConnected$;
  readonly connectedToMessage$: Observable<string> =
    this.expressvpnService.connectedToMessage$;
  readonly isConnecting$: Observable<boolean> =
    this.expressvpnService.isConnecting$;
  readonly isDisconnecting$: Observable<boolean> =
    this.expressvpnService.isDisconnecting$;

  readonly autoConnect$ = new BehaviorSubject<boolean>(false);
  readonly blockTrackers$ = new BehaviorSubject<boolean>(false);
  readonly desktopNotifications$ = new BehaviorSubject<boolean>(false);
  readonly disableIpv6$ = new BehaviorSubject<boolean>(false);
  readonly networkLock$ = new BehaviorSubject<NetworkLock>('off');

  constructor(
    private readonly expressvpnService: ExpresssvpnService,
    private readonly dialog: MatDialog
  ) {}

  openDialog(): void {
    this.dialog.open(this.settingsDialog, {
      width: '500px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  autoConnectChange(value: boolean) {
    this.autoConnect$.next(value);
  }

  blockTrackersChange(value: boolean) {
    this.blockTrackers$.next(value);
  }

  desktopNotificationsChange(value: boolean) {
    this.desktopNotifications$.next(value);
  }

  disableIpv6Change(value: boolean) {
    this.disableIpv6$.next(value);
  }

  networkLockChange(value: NetworkLock) {
    this.networkLock$.next(value);
  }
}
