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
  smartLocation$: Observable<ExpressvpnLocation> =
    this.expressvpnLocationsService.smartLocation$;

  constructor(
    private readonly expressvpnLocationsService: ExpresssvpnLocationsService,
    private readonly expressvpnService: ExpresssvpnService
  ) {}

  showLocations(): void {
    this.expressvpnLocationsService.locations$.subscribe();
  }

  connectToLocation(location: string) {
    this.expressvpnService.connectToLocation(location);
  }
}
