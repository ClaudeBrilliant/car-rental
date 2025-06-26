export enum Action {
  // Generic CRUD
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // Management & Control
  MANAGE = 'manage', // e.g. full control over a module
  ASSIGN = 'assign', // Assign car, agent, or task
  APPROVE = 'approve', // Approve bookings or payments
  REJECT = 'reject', // Reject bookings or reviews
  CANCEL = 'cancel', // Cancel a booking or request
  COMPLETE = 'complete', // Mark booking as completed

  // Payment and Coupons
  PAY = 'pay',
  ISSUE_REFUND = 'issue_refund',
  APPLY_COUPON = 'apply_coupon',
  GENERATE_INVOICE = 'generate_invoice',

  // User/Account Actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  VERIFY = 'verify', // Email or phone verification
  RESET_PASSWORD = 'reset_password',
  UPDATE_PROFILE = 'update_profile',

  // Vehicle-Specific
  SERVICE = 'service', // Mark for maintenance
  UPDATE_AVAILABILITY = 'update_availability',

  // Notifications and Reviews
  SEND_NOTIFICATION = 'send_notification',
  RESPOND_REVIEW = 'respond_review',

  // Audit & System
  VIEW_STATS = 'view_stats',
  EXPORT_DATA = 'export_data',
  ACCESS_ADMIN_DASHBOARD = 'access_admin_dashboard',
}
