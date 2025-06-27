import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Permission } from '../enums/permissions.enum';
import { ROLE_PERMISSIONS } from 'src/config/permission.config';
import { PermissionContext } from '../interfaces/permissions.interface';

@Injectable()
export class PermissionsService {
  /**
   * Get permissions for a specific role.
   */
  getPermissionsForRole(role: UserRole): Permission[] {
    const roleConfig = ROLE_PERMISSIONS.find((config) => config.role === role);
    return roleConfig?.permissions || [];
  }

  /**
   * Check if a user role has a specific permission.
   */
  hasPermission(userRole: UserRole, permission: Permission): boolean {
    return this.getPermissionsForRole(userRole).includes(permission);
  }

  /**
   * Check if a user role has any of the given permissions.
   */
  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Check if a user role has all of the given permissions.
   */
  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Context-aware permission checks.
   */
  hasContextualPermission(
    context: PermissionContext,
    permission: Permission,
  ): boolean {
    const { user, resource } = context;

    if (!this.hasPermission(user.role, permission)) return false;
    if (user.role === UserRole.ADMIN) return true;

    switch (permission) {
      // Profile
      case Permission.VIEW_PROFILE:
      case Permission.UPDATE_PROFILE:
      case Permission.CHANGE_PASSWORD:
        return resource?.ownerId === user.id;

      // Bookings
      case Permission.READ_BOOKING:
      case Permission.UPDATE_BOOKING:
      case Permission.CANCEL_BOOKING:
      case Permission.COMPLETE_BOOKING:
        return resource?.ownerId === user.id;

      // Reviews
      case Permission.RESPOND_REVIEW:
      case Permission.DELETE_REVIEW:
        return resource?.ownerId === user.id || user.role === UserRole.AGENT;

      // Coupons
      case Permission.APPLY_COUPON:
        return resource?.ownerId === user.id;

      // Notifications
      case Permission.READ_NOTIFICATION:
        return resource?.ownerId === user.id;

      // Payments
      case Permission.INITIATE_PAYMENT:
      case Permission.VIEW_PAYMENT:
        return resource?.ownerId === user.id;

      // // Locations
      // case Permission.VIEW_LOCATIONS:
      // case Permission.MANAGE_LOCATIONS:
      //   return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      // // Vehicles
      // case Permission.ASSIGN_VEHICLE:
      // case Permission.MARK_VEHICLE_MAINTENANCE:
      //   return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      // // Dashboard
      // case Permission.VIEW_DASHBOARD:
      //   return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;

      default:
        return true;
    }
  }

  /**
   * Get the effective permissions for a user based on role and resource ownership.
   */
  getEffectivePermissions(
    userRole: UserRole,
    userId: string,
    resourceOwnerId?: string,
  ): Permission[] {
    const basePermissions = this.getPermissionsForRole(userRole);

    if (userRole === UserRole.ADMIN) return basePermissions;

    return basePermissions.filter((permission) =>
      this.hasContextualPermission(
        {
          user: { id: userId, role: userRole },
          resource: resourceOwnerId
            ? { id: resourceOwnerId, ownerId: resourceOwnerId, type: 'user' }
            : undefined,
        },
        permission,
      ),
    );
  }

  /**
   * Utility to create a permission string.
   */
  createPermission(action: string, resource: string): string {
    return `${action}:${resource}`;
  }

  /**
   * Utility to parse a permission string.
   */
  parsePermission(permission: Permission): {
    action: string;
    resource: string;
  } {
    const [action, resource] = permission.split(':');
    return { action, resource };
  }
}
