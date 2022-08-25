import { Component } from '@angular/core';
import { combineLatest, Observable, take } from 'rxjs';
import { ExpresssvpnLocationsService } from '../../../core/services';

@Component({
  selector: 'app-connect-to-location',
  templateUrl: './connect-to-location.component.html',
  styleUrls: ['./connect-to-location.component.scss'],
})
export class ConnectToLocationComponent {
  constructor(
    private readonly expressvpnLocationsService: ExpresssvpnLocationsService
  ) {}

  showLocations(): void {
    this.expressvpnLocationsService.locations$.subscribe();
  }
}
