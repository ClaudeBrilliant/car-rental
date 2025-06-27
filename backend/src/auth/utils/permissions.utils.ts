import { UserRole } from '@prisma/client';
import { Permission } from '../enums/permissions.enum';

/**
 * Permission utility class for role-based access control and authorization
 */
export class PermissionsUtils {
  /**
   * Check if a user can perform an action on a resource, with optional ownership verification
   *
   * @param userRole - The role of the user attempting the action
   * @param userId - The ID of the user attempting the action
   * @param action - The permission being requested
   * @param resourceOwnerId - Optional ID of the resource owner for ownership-based permissions
   * @returns boolean indicating if the action is permitted
   */
  static canPerformAction(
    userRole: UserRole,
    userId: string,
    action: Permission,
    resourceOwnerId?: string,
  ): boolean {
    // Admins have unrestricted access
    if (userRole === UserRole.ADMIN) return true;

    // Permissions that require ownership verification
    const ownershipRequired: Permission[] = [
      Permission.VIEW_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.CHANGE_PASSWORD,
      Permission.READ_BOOKING,
      Permission.CANCEL_BOOKING,
      Permission.INITIATE_PAYMENT,
      Permission.VIEW_PAYMENT,
      Permission.READ_NOTIFICATION,
      Permission.APPLY_COUPON,
      Permission.DELETE_REVIEW,
    ];

    // Permissions that agents can perform regardless of ownership
    const agentPermissions: Permission[] = [
      Permission.READ_VEHICLE,
      Permission.CREATE_VEHICLE,
      Permission.UPDATE_VEHICLE,
      Permission.ASSIGN_VEHICLE,
      Permission.MARK_VEHICLE_MAINTENANCE,
      Permission.MANAGE_VEHICLES,
      Permission.UPDATE_BOOKING,
      Permission.APPROVE_BOOKING,
      Permission.REJECT_BOOKING,
      Permission.COMPLETE_BOOKING,
      Permission.MANAGE_BOOKINGS,
      Permission.RESPOND_REVIEW,
      Permission.SEND_NOTIFICATION,
      Permission.READ_NOTIFICATION,
      Permission.VIEW_DASHBOARD,
      Permission.MANAGE_LOCATIONS,
      Permission.VIEW_LOCATIONS,
      Permission.READ_REVIEW,
    ];

    // Permissions that customers can perform regardless of ownership
    const customerPermissions: Permission[] = [
      Permission.READ_VEHICLE,
      Permission.CREATE_BOOKING,
      Permission.READ_REVIEW,
      Permission.VIEW_LOCATIONS,
    ];

    // Check role-based permissions first
    if (userRole === UserRole.AGENT && agentPermissions.includes(action)) {
      return true;
    }

    if (
      userRole === UserRole.CUSTOMER &&
      customerPermissions.includes(action)
    ) {
      return true;
    }

    // Check ownership-based permissions
    if (ownershipRequired.includes(action)) {
      return userId === resourceOwnerId;
    }

    // If not in any allowed list and not ADMIN, deny access
    return false;
  }

  /**
   * Generate comprehensive permission matrix for UI control and role auditing
   *
   * @param userRole - The user role to generate permissions for
   * @returns Object containing categorized permissions with boolean values
   */
  static generatePermissionMatrix(userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;
    const isAgent = userRole === UserRole.AGENT;
    const isCustomer = userRole === UserRole.CUSTOMER;

    return {
      users: {
        [Permission.CREATE_USER]: isAdmin,
        [Permission.READ_USER]: isAdmin,
        [Permission.UPDATE_USER]: isAdmin,
        [Permission.DELETE_USER]: isAdmin,
        [Permission.MANAGE_USERS]: isAdmin,
      },

      vehicles: {
        [Permission.CREATE_VEHICLE]: isAdmin || isAgent,
        [Permission.READ_VEHICLE]: true,
        [Permission.UPDATE_VEHICLE]: isAdmin || isAgent,
        [Permission.DELETE_VEHICLE]: isAdmin,
        [Permission.ASSIGN_VEHICLE]: isAdmin || isAgent,
        [Permission.MARK_VEHICLE_MAINTENANCE]: isAdmin || isAgent,
        [Permission.MANAGE_VEHICLES]: isAdmin || isAgent,
      },

      bookings: {
        [Permission.CREATE_BOOKING]: isCustomer,
        [Permission.READ_BOOKING]: true, // ownership checked separately
        [Permission.UPDATE_BOOKING]: isAdmin || isAgent,
        [Permission.DELETE_BOOKING]: isAdmin,
        [Permission.CANCEL_BOOKING]: isCustomer, // ownership checked separately
        [Permission.APPROVE_BOOKING]: isAdmin || isAgent,
        [Permission.REJECT_BOOKING]: isAdmin || isAgent,
        [Permission.COMPLETE_BOOKING]: isAdmin || isAgent,
        [Permission.MANAGE_BOOKINGS]: isAdmin || isAgent,
      },

      payments: {
        [Permission.INITIATE_PAYMENT]: isCustomer, // ownership checked separately
        [Permission.VIEW_PAYMENT]: isCustomer || isAdmin, // ownership checked separately
        [Permission.ISSUE_REFUND]: isAdmin,
        [Permission.APPLY_COUPON]: isCustomer, // ownership checked separately
        [Permission.MANAGE_COUPONS]: isAdmin,
      },

      reviews: {
        [Permission.READ_REVIEW]: true,
        [Permission.RESPOND_REVIEW]: isAgent || isAdmin,
        [Permission.DELETE_REVIEW]: isCustomer, // ownership checked separately
      },

      notifications: {
        [Permission.SEND_NOTIFICATION]: isAdmin || isAgent,
        [Permission.READ_NOTIFICATION]: true, // ownership checked separately
      },

      locations: {
        [Permission.VIEW_LOCATIONS]: true,
        [Permission.MANAGE_LOCATIONS]: isAdmin || isAgent,
      },

      account: {
        [Permission.VIEW_PROFILE]: true, // ownership checked separately
        [Permission.UPDATE_PROFILE]: true, // ownership checked separately
        [Permission.CHANGE_PASSWORD]: true, // ownership checked separately
      },

      system: {
        [Permission.ACCESS_ADMIN_PANEL]: isAdmin,
        [Permission.VIEW_DASHBOARD]: isAdmin || isAgent,
        [Permission.MANAGE_SETTINGS]: isAdmin,
      },

      auditLogs: {
        [Permission.READ_AUDIT_LOGS]: isAdmin,
      },
    };
  }

  /**
   * Get all permissions available to a specific user role
   *
   * @param userRole - The user role to get permissions for
   * @returns Array of permissions available to the role
   */
  static getUserRolePermissions(userRole: UserRole): Permission[] {
    const matrix = this.generatePermissionMatrix(userRole);
    const permissions: Permission[] = [];

    Object.values(matrix).forEach((section) => {
      Object.entries(section).forEach(([permission, hasPermission]) => {
        if (
          hasPermission &&
          Object.values(Permission).includes(permission as Permission)
        ) {
          permissions.push(permission as Permission);
        }
      });
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Check if a user role has a specific permission (without ownership verification)
   *
   * @param userRole - The user role to check
   * @param permission - The permission to verify
   * @returns boolean indicating if the role has the permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const matrix = this.generatePermissionMatrix(userRole);

    for (const section of Object.values(matrix)) {
      if (section[permission]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get permissions that require ownership verification
   *
   * @returns Array of permissions that require ownership checks
   */
  static getOwnershipRequiredPermissions(): Permission[] {
    return [
      Permission.VIEW_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.CHANGE_PASSWORD,
      Permission.READ_BOOKING,
      Permission.CANCEL_BOOKING,
      Permission.INITIATE_PAYMENT,
      Permission.VIEW_PAYMENT,
      Permission.READ_NOTIFICATION,
      Permission.APPLY_COUPON,
      Permission.DELETE_REVIEW,
    ];
  }

  /**
   * Get permissions grouped by category
   *
   * @returns Object with permissions organized by functional area
   */
  static getPermissionsByCategory() {
    return {
      userManagement: [
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.MANAGE_USERS,
      ],
      vehicleManagement: [
        Permission.CREATE_VEHICLE,
        Permission.READ_VEHICLE,
        Permission.UPDATE_VEHICLE,
        Permission.DELETE_VEHICLE,
        Permission.MANAGE_VEHICLES,
        Permission.ASSIGN_VEHICLE,
        Permission.MARK_VEHICLE_MAINTENANCE,
      ],
      bookingManagement: [
        Permission.CREATE_BOOKING,
        Permission.READ_BOOKING,
        Permission.UPDATE_BOOKING,
        Permission.DELETE_BOOKING,
        Permission.APPROVE_BOOKING,
        Permission.REJECT_BOOKING,
        Permission.CANCEL_BOOKING,
        Permission.COMPLETE_BOOKING,
        Permission.MANAGE_BOOKINGS,
      ],
      paymentManagement: [
        Permission.INITIATE_PAYMENT,
        Permission.VIEW_PAYMENT,
        Permission.ISSUE_REFUND,
        Permission.APPLY_COUPON,
        Permission.MANAGE_COUPONS,
      ],
      reviewManagement: [
        Permission.READ_REVIEW,
        Permission.RESPOND_REVIEW,
        Permission.DELETE_REVIEW,
      ],
      notificationManagement: [
        Permission.SEND_NOTIFICATION,
        Permission.READ_NOTIFICATION,
      ],
      systemAdministration: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_SETTINGS,
        Permission.ACCESS_ADMIN_PANEL,
        Permission.READ_AUDIT_LOGS,
      ],
      accountManagement: [
        Permission.VIEW_PROFILE,
        Permission.UPDATE_PROFILE,
        Permission.CHANGE_PASSWORD,
      ],
      locationManagement: [
        Permission.MANAGE_LOCATIONS,
        Permission.VIEW_LOCATIONS,
      ],
    };
  }

  /**
   * Validate if a permission exists in the system
   *
   * @param permission - The permission string to validate
   * @returns boolean indicating if the permission is valid
   */
  static isValidPermission(permission: string): permission is Permission {
    return Object.values(Permission).includes(permission as Permission);
  }
}
