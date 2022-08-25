import { Component } from '@angular/core';
import { combineLatest, Observable, take } from 'rxjs';
import { ExpresssvpnService } from '../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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

  constructor(private readonly expressvpnService: ExpresssvpnService) {}

  iconClick(): void {
    combineLatest([
      this.isConnected$,
      this.isConnecting$,
      this.isDisconnecting$,
    ])
      .pipe(take(1))
      .subscribe(([isConnected, isConnecting, isDisconnecting]) => {
        if (!isConnected && !isConnecting) {
          this.expressvpnService.quickConnect();
        } else if (isConnected && !isDisconnecting) {
          this.expressvpnService.disconnect();
        }
      });
  }
}
