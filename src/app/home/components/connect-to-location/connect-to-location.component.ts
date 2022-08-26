import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, take } from 'rxjs';
import {
  ExpressvpnLocation,
  LocationsSortedByCountry,
} from '../../../core/models';
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
  readonly locationsSortedByCountry$ =
    this.expressvpnLocationsService.locationsSortedByCountry$;
  readonly recommendedLocationsSortedByCountry$ =
    this.expressvpnLocationsService.recommendedLocationsSortedByCountry$;

  readonly locationList$ = new BehaviorSubject<LocationsSortedByCountry>([]);
  readonly showLocationList$ = new BehaviorSubject<boolean>(false);
  readonly fadeOutLocationList$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly expressvpnLocationsService: ExpresssvpnLocationsService,
    private readonly expressvpnService: ExpresssvpnService
  ) {}

  showRecommendedLocations(locations: LocationsSortedByCountry): void {
    this.locationList$.next(locations);
    this.showLocationList();
  }

  showLocations(locations: LocationsSortedByCountry): void {
    this.locationList$.next(locations);
    this.showLocationList();
  }

  connectToLocation(location: string) {
    this.expressvpnService.connectToLocation(location);
  }

  hideLocationList(): void {
    this.fadeOutLocationList$.next(true);

    setTimeout(() => {
      this.fadeOutLocationList$.next(false);
      this.showLocationList$.next(false);
    }, 80);
  }

  private showLocationList(): void {
    this.showLocationList$.next(true);
  }
}
