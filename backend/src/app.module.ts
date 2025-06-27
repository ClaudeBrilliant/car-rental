import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BookingsModule } from './bookings/bookings.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogModule } from './audit-logs/audit-logs.module';
import { LocationModule } from './locations/locations.module';
import { NotificationModule } from './notifications/notifications.module';
import { ReviewModule } from './reviews/reviews.module';

@Module({
  imports: [
    UsersModule,
    VehiclesModule,
    BookingsModule,
    ReviewModule,
    LocationModule,
    NotificationModule,
    SettingsModule,
    AuditLogModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
