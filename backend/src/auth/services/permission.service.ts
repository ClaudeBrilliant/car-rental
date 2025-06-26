import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Permission } from '../enums/permissions.enum';
import { ROLE_PERMISSIONS } from 'src/config/permission.config';
import { PermissionContext } from '../interfaces/permissions.interface';

@Injectable()
export class PermissionsService {
  getPermissionsForRole(role: UserRole): Permission[] {
    const roleConfig = ROLE_PERMISSIONS.find((config) => config.role === role);
    return roleConfig?.permissions || [];
  }

  hasPermission(userRole: UserRole, permission: Permission): boolean {
    const userPermissions = this.getPermissionsForRole(userRole);
    return userPermissions.includes(permission);
  }

  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Evaluates contextual permissions for certain actions
   */
  hasContextualPermission(
    context: PermissionContext,
    permission: Permission,
  ): boolean {
    const { user, resource } = context;

    // Step 1: Check role permission
    if (!this.hasPermission(user.role, permission)) return false;

    // Step 2: Admins can do anything their role permits
    if (user.role === UserRole.ADMIN) return true;

    // Step 3: Ownership-based contextual permission checks
    switch (permission) {
      // Profile / Account
      case Permission.VIEW_PROFILE:
      case Permission.UPDATE_PROFILE:
      case Permission.CHANGE_PASSWORD:
        return resource?.ownerId === user.id;

      // Bookings — customers can manage their own bookings
      case Permission.READ_BOOKING:
      case Permission.UPDATE_BOOKING:
      case Permission.CANCEL_BOOKING:
      case Permission.COMPLETE_BOOKING:
        return resource?.ownerId === user.id;

      // Reviews — customers can delete/respond to their own, agents can respond
      case Permission.RESPOND_REVIEW:
      case Permission.DELETE_REVIEW:
        return resource?.ownerId === user.id || user.role === UserRole.AGENT;

      // Coupons — customers apply on their own bookings
      case Permission.APPLY_COUPON:
        return resource?.ownerId === user.id;

      // Notifications — users can only view their own
      case Permission.READ_NOTIFICATION:
        return resource?.ownerId === user.id;

      // Payments — initiating or viewing tied to your booking
      case Permission.INITIATE_PAYMENT:
      case Permission.VIEW_PAYMENT:
        return resource?.ownerId === user.id;

      // Locations — Agents managing locations might depend on ownership
      case Permission.VIEW_LOCATIONS:
      case Permission.MANAGE_LOCATIONS:
        return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      // Vehicles — Assigning or marking maintenance is Agent/Admin only
      case Permission.ASSIGN_VEHICLE:
      case Permission.MARK_VEHICLE_MAINTENANCE:
        return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      // Dashboard — Agents may view limited dashboard data
      case Permission.VIEW_DASHBOARD:
        return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      default:
        // For everything else, rely on role-based check
        return true;
    }
  }
}
