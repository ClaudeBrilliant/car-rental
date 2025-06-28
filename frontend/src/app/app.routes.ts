import { Routes } from '@angular/router';
import { HotelDashboard } from './hotel-dashboard/hotel-dashboard';
import { BookingManagement } from './components/booking-management/booking-management';
import { Rooms } from './components/rooms/rooms';
import { RoomList } from './components/room-list/room-list';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth-guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['ADMIN'] },
    component: HotelDashboard,
  },
  {
    path: 'bookings',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['STAFF', 'ADMIN'] },
    component: BookingManagement,
  },
  {
    path: 'rooms',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['GUEST', 'STAFF', 'ADMIN'] },
    component: Rooms,
  },
  {
    path: 'room/list',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['GUEST', 'STAFF', 'ADMIN'] },
    component: RoomList,
  },
  { path: 'login', component: Login },
  { path: 'unauthorized', component: UnauthorizedComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: '/unauthorized' },
];
