import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Rooms } from "./components/rooms/rooms";
import { RoomList } from "./components/room-list/room-list";
import { HotelDashboard } from "./hotel-dashboard/hotel-dashboard";
import { BookingManagement } from "./components/booking-management/booking-management";
import { NavbarComponent } from "./components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Rooms, RoomList, HotelDashboard, BookingManagement, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'hotel-ui';
}
