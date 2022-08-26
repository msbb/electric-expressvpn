import { Component } from '@angular/core';
import { combineLatest, Observable, take } from 'rxjs';
import { ExpressvpnLocation } from '../../../core/models';
import {
  ExpresssvpnLocationsService,
  ExpresssvpnService,
} from '../../../core/services';

@Component({
  selector: 'app-connect-to-location',
  templateUrl: './connect-to-location.component.html',
  styleUrls: ['./connect-to-location.component.scss'],
})
export class ConnectToLocationComponent {
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
  readonly smartLocation$: Observable<ExpressvpnLocation> =
    this.expressvpnLocationsService.smartLocation$;

  constructor(
    private readonly expressvpnLocationsService: ExpresssvpnLocationsService,
    private readonly expressvpnService: ExpresssvpnService
  ) {}

  showLocations(): void {
    this.expressvpnLocationsService.recommendedLocationsSortedByCountry$.subscribe();
  }

  connectToLocation(location: string) {
    this.expressvpnService.connectToLocation(location);
  }
}
