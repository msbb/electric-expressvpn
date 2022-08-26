import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, combineLatest, Observable, take } from 'rxjs';
import {
  CountryWithLocations,
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
  @ViewChild('locationDialog', { static: true })
  locationDialog: TemplateRef<any>;

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
  readonly selectedCountryCode$ = new BehaviorSubject<string>('');
  readonly recommendedLocations$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly expressvpnLocationsService: ExpresssvpnLocationsService,
    private readonly expressvpnService: ExpresssvpnService,
    private readonly dialog: MatDialog
  ) {}

  showRecommendedLocations(locations: LocationsSortedByCountry): void {
    this.recommendedLocations$.next(true);
    this.locationList$.next(locations);
    this.openLocationsDialog();
  }

  showLocations(locations: LocationsSortedByCountry): void {
    this.recommendedLocations$.next(false);
    this.locationList$.next(locations);
    this.openLocationsDialog();
  }

  connectToLocation(location: string) {
    this.expressvpnService.connectToLocation(location);
  }

  selectCountry(countryWithLocations: CountryWithLocations): void {
    if (countryWithLocations.locations.length > 1) {
      this.selectedCountryCode$.next(countryWithLocations.countryCode);
    } else {
      this.closeDialog();
      this.connectToLocation(countryWithLocations.locations[0].location);
    }
  }

  onCountrySelect(change: MatSelectionListChange) {
    const selectedOption = change.options.find((option) => option.selected);
    this.closeDialog();
    this.connectToLocation(selectedOption.value);
  }

  private openLocationsDialog(): void {
    this.dialog.open(this.locationDialog, { width: '500px' });
  }

  private closeDialog(): void {
    this.clearCountryCode();
    this.dialog.closeAll();
  }

  private clearCountryCode(): void {
    this.selectedCountryCode$.next('');
  }
}
