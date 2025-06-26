export enum Permission {
  // User Management
  CREATE_USER = 'user:create',
  READ_USER = 'user:read',
  UPDATE_USER = 'user:update',
  DELETE_USER = 'user:delete',
  MANAGE_USERS = 'user:manage',

  // Vehicle Management
  CREATE_VEHICLE = 'vehicle:create',
  READ_VEHICLE = 'vehicle:read',
  UPDATE_VEHICLE = 'vehicle:update',
  DELETE_VEHICLE = 'vehicle:delete',
  MANAGE_VEHICLES = 'vehicle:manage',
  ASSIGN_VEHICLE = 'vehicle:assign',
  MARK_VEHICLE_MAINTENANCE = 'vehicle:mark_maintenance',

  // Booking Management
  CREATE_BOOKING = 'booking:create',
  READ_BOOKING = 'booking:read',
  UPDATE_BOOKING = 'booking:update',
  DELETE_BOOKING = 'booking:delete',
  APPROVE_BOOKING = 'booking:approve',
  REJECT_BOOKING = 'booking:reject',
  CANCEL_BOOKING = 'booking:cancel',
  COMPLETE_BOOKING = 'booking:complete',
  MANAGE_BOOKINGS = 'booking:manage',

  // Payment & Coupon
  INITIATE_PAYMENT = 'payment:initiate',
  VIEW_PAYMENT = 'payment:view',
  ISSUE_REFUND = 'payment:refund',
  APPLY_COUPON = 'payment:apply_coupon',
  MANAGE_COUPONS = 'payment:manage_coupons',

  // Reviews
  READ_REVIEW = 'review:read',
  RESPOND_REVIEW = 'review:respond',
  DELETE_REVIEW = 'review:delete',

  // Notifications
  SEND_NOTIFICATION = 'notification:send',
  READ_NOTIFICATION = 'notification:read',

  // System Settings
  VIEW_DASHBOARD = 'system:view_dashboard',
  MANAGE_SETTINGS = 'system:manage_settings',
  ACCESS_ADMIN_PANEL = 'system:access_admin',

  // Profile / Account
  VIEW_PROFILE = 'account:view',
  UPDATE_PROFILE = 'account:update',
  CHANGE_PASSWORD = 'account:change_password',

  // Audit Logs
  READ_AUDIT_LOGS = 'audit:read',

  // Location Management
  MANAGE_LOCATIONS = 'location:manage',
  VIEW_LOCATIONS = 'location:view',
  VIEW_CART = 'VIEW_CART',
}
