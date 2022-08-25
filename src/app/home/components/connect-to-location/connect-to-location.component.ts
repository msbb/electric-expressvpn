import { Component } from '@angular/core';
import { combineLatest, Observable, take } from 'rxjs';
import { ExpresssvpnService } from '../../../../app/core/services/expressvpn/expressvpn.service';

@Component({
  selector: 'app-connect-to-location',
  templateUrl: './connect-to-location.component.html',
  styleUrls: ['./connect-to-location.component.scss'],
})
export class ConnectToLocationComponent {
  constructor(private readonly expressvpnService: ExpresssvpnService) {}

  showLocations(): void {
    this.expressvpnService.locations$.subscribe();
  }
}
