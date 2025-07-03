import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VehicleDashboardComponent } from "./vehicle-dashboard/vehicle-dashboard";
import { VehicleBookingManagementComponent } from "./components/booking-management/booking-management";
import { NavbarComponent } from "./components/navbar/navbar";
import { VehicleList } from './components/vehicle-list/vehicle-list';
import { VehicleComponent } from './components/vehicle/vehicle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VehicleList,  VehicleComponent,VehicleDashboardComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'hotel-ui';
}
