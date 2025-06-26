/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UserRole } from '@prisma/client';
import { Permission } from 'src/auth/enums/permissions.enum';
import { PermissionRule } from 'src/auth/interfaces/permissions.interface';

export const ROLE_PERMISSIONS: PermissionRule[] = [
  {
    role: UserRole.ADMIN,
    permissions: [
      // User Management
      Permission.CREATE_USER,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.DELETE_USER,
      Permission.MANAGE_USERS,

      // Vehicle Management
      Permission.CREATE_VEHICLE,
      Permission.READ_VEHICLE,
      Permission.UPDATE_VEHICLE,
      Permission.DELETE_VEHICLE,
      Permission.ASSIGN_VEHICLE,
      Permission.MARK_VEHICLE_MAINTENANCE,
      Permission.MANAGE_VEHICLES,

      // Booking Management
      Permission.CREATE_BOOKING,
      Permission.READ_BOOKING,
      Permission.UPDATE_BOOKING,
      Permission.DELETE_BOOKING,
      Permission.CANCEL_BOOKING,
      Permission.APPROVE_BOOKING,
      Permission.REJECT_BOOKING,
      Permission.COMPLETE_BOOKING,
      Permission.MANAGE_BOOKINGS,

      // Payment Management
      Permission.INITIATE_PAYMENT,
      Permission.VIEW_PAYMENT,
      Permission.ISSUE_REFUND,
      Permission.APPLY_COUPON,
      Permission.MANAGE_COUPONS,

      // Review Management
      Permission.READ_REVIEW,
      Permission.RESPOND_REVIEW,
      Permission.DELETE_REVIEW,

      // Notification Management
      Permission.SEND_NOTIFICATION,
      Permission.READ_NOTIFICATION,

      // Location Management
      Permission.VIEW_LOCATIONS,
      Permission.MANAGE_LOCATIONS,

      // Profile / Account
      Permission.VIEW_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.CHANGE_PASSWORD,

      // System / Admin
      Permission.ACCESS_ADMIN_PANEL,
      Permission.VIEW_DASHBOARD,
      Permission.MANAGE_SETTINGS,
      Permission.READ_AUDIT_LOGS,
    ],
  },
  {
    role: UserRole.AGENT,
    permissions: [
      // Vehicle Management
      Permission.READ_VEHICLE,
      Permission.CREATE_VEHICLE,
      Permission.UPDATE_VEHICLE,
      Permission.ASSIGN_VEHICLE,
      Permission.MARK_VEHICLE_MAINTENANCE,
      Permission.MANAGE_VEHICLES,

      // Booking Management
      Permission.UPDATE_BOOKING,
      Permission.APPROVE_BOOKING,
      Permission.REJECT_BOOKING,
      Permission.COMPLETE_BOOKING,
      Permission.MANAGE_BOOKINGS,

      // Review Management
      Permission.READ_REVIEW,
      Permission.RESPOND_REVIEW,

      // Notification Management
      Permission.SEND_NOTIFICATION,
      Permission.READ_NOTIFICATION,

      // Location Management
      Permission.VIEW_LOCATIONS,
      Permission.MANAGE_LOCATIONS,

      // System / Dashboard
      Permission.VIEW_DASHBOARD,

      // Profile / Account
      Permission.VIEW_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.CHANGE_PASSWORD,
    ],
  },
  {
    role: UserRole.CUSTOMER,
    permissions: [
      // Vehicle
      Permission.READ_VEHICLE,

      // Booking (ownership-based permissions handled separately)
      Permission.CREATE_BOOKING,
      Permission.READ_BOOKING,
      Permission.CANCEL_BOOKING,

      // Payment (ownership-based permissions handled separately)
      Permission.INITIATE_PAYMENT,
      Permission.VIEW_PAYMENT,
      Permission.APPLY_COUPON,

      // Review Management
      Permission.READ_REVIEW,
      Permission.DELETE_REVIEW, // ownership-based

      // Location
      Permission.VIEW_LOCATIONS,

      // Notifications (ownership-based)
      Permission.READ_NOTIFICATION,

      // Profile / Account (ownership-based permissions handled separately)
      Permission.VIEW_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.CHANGE_PASSWORD,
    ],
  },
];
