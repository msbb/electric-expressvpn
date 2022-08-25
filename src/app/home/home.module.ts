import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { ConnectToLocationComponent } from './components/connect-to-location/connect-to-location.component';

@NgModule({
  declarations: [HomeComponent, ConnectToLocationComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule],
})
export class HomeModule {}
