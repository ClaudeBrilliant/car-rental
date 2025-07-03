import { Routes } from '@angular/router';
import { VehicleDashboardComponent } from './vehicle-dashboard/vehicle-dashboard';
import { Rooms } from './components/rooms/rooms';
import { RoomList } from './components/room-list/room-list';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth-guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized';
import { RoleGuard } from './guards/role-guard';
import { VehicleBookingManagementComponent } from './components/booking-management/booking-management';
import { VehicleComponent } from './components/vehicle/vehicle';
import { VehicleList } from './components/vehicle-list/vehicle-list';

export const routes: Routes = [
  {
    path: 'dashboard',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['ADMIN'] },
    component: VehicleDashboardComponent,
  },
  {
    path: 'bookings',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['AGENT' , 'ADMIN'] },
    component: VehicleBookingManagementComponent,
  },
  {
    path: 'vehicles',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    component: VehicleComponent,
  },
  {
    path: 'vehicles/list',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    component: VehicleList,
  },
  { path: 'login', component: Login },
  { path: 'unauthorized', component: UnauthorizedComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: '/unauthorized' },
];
