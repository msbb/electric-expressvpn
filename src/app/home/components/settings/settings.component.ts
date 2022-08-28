import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatDrawer } from '@angular/material/sidenav';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import {
  CountryWithLocations,
  ExpressvpnLocation,
  LocationsSortedByCountry,
  NetworkLock,
  ExpressvpnPreference,
  PreferredProtocol,
} from '../../../core/models';
import {
  ExpresssvpnLocationsService,
  ExpresssvpnPreferencesService,
  ExpresssvpnService,
} from '../../../core/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild('settingsDialog', { static: true })
  settingsDialog: TemplateRef<any>;

  readonly isActivated$: Observable<boolean> =
    this.expressvpnService.isActivated$;
  readonly isConnected$: Observable<boolean> =
    this.expressvpnService.isConnected$;
  readonly isConnecting$: Observable<boolean> =
    this.expressvpnService.isConnecting$;
  readonly isDisconnecting$: Observable<boolean> =
    this.expressvpnService.isDisconnecting$;
  readonly preferencesDisabled$: Observable<boolean> =
    this.expressvpnPreferencesService.preferencesDisabled$;

  readonly autoConnect$ = new BehaviorSubject<boolean>(false);
  readonly blockTrackers$ = new BehaviorSubject<boolean>(false);
  readonly desktopNotifications$ = new BehaviorSubject<boolean>(false);
  readonly disableIpv6$ = new BehaviorSubject<boolean>(false);
  readonly sendDiagnostics$ = new BehaviorSubject<boolean>(false);
  readonly networkLock$ = new BehaviorSubject<NetworkLock>('off');
  readonly preferredProtocol$ = new BehaviorSubject<PreferredProtocol>('auto');

  private preferencesSubscription!: Subscription;

  constructor(
    private readonly expressvpnService: ExpresssvpnService,
    private readonly expressvpnPreferencesService: ExpresssvpnPreferencesService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.openPreferencesSubscription();
    this.expressvpnPreferencesService.refreshPreferences();
  }

  ngOnDestroy(): void {
    this.preferencesSubscription?.unsubscribe();
  }

  openDialog(): void {
    this.expressvpnPreferencesService.refreshPreferences();
    this.dialog.open(this.settingsDialog, {
      width: '500px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  autoConnectChange(value: boolean) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.autoConnect,
      value ? 'true' : 'false'
    );
    this.autoConnect$.next(value);
  }

  blockTrackersChange(value: boolean) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.blockTrackers,
      value ? 'true' : 'false'
    );
    this.blockTrackers$.next(value);
  }

  desktopNotificationsChange(value: boolean) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.desktopNotifications,
      value ? 'true' : 'false'
    );
    this.desktopNotifications$.next(value);
  }

  disableIpv6Change(value: boolean) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.disableIpv6,
      value ? 'true' : 'false'
    );
    this.disableIpv6$.next(value);
  }

  sendDiagnosticsChange(value: boolean) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.sendDiagnostics,
      value ? 'true' : 'false'
    );
    this.sendDiagnostics$.next(value);
  }

  networkLockChange(value: NetworkLock) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.networkLock,
      value
    );
    this.networkLock$.next(value);
  }

  preferredProtocolChange(value: PreferredProtocol) {
    this.expressvpnPreferencesService.setPreference(
      ExpressvpnPreference.preferredProtocol,
      value
    );
    this.preferredProtocol$.next(value);
  }

  private openPreferencesSubscription(): void {
    this.expressvpnPreferencesService.expressvpnPreferences$.subscribe(
      (preferences) => {
        if (preferences) {
          const autoConnect = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.autoConnect
          );
          const blockTrackers = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.blockTrackers
          );
          const desktopNotifications = preferences.find(
            (pref) =>
              pref.preference === ExpressvpnPreference.desktopNotifications
          );
          const disableIpv6 = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.disableIpv6
          );
          const networkLock = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.networkLock
          );
          const preferredProtocol = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.preferredProtocol
          );
          const sendDiagnostics = preferences.find(
            (pref) => pref.preference === ExpressvpnPreference.sendDiagnostics
          );

          this.autoConnect$.next(autoConnect.value === 'true');
          this.blockTrackers$.next(blockTrackers.value === 'true');
          this.desktopNotifications$.next(
            desktopNotifications.value === 'true'
          );
          this.disableIpv6$.next(disableIpv6.value === 'true');
          this.sendDiagnostics$.next(sendDiagnostics.value === 'true');
          this.networkLock$.next(networkLock.value as NetworkLock);
          this.preferredProtocol$.next(
            preferredProtocol.value as PreferredProtocol
          );
        }
      }
    );
  }
}
