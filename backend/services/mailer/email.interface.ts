export interface EmailContext {
  name: string;
  email: string;
  [key: string]: any;
}

// Welcome Email
export interface WelcomeEmailContext extends EmailContext {
  loginUrl: string;
  supportEmail: string;
}

// Password Reset Email
export interface PasswordResetEmailContext extends EmailContext {
  resetUrl: string;
  resetToken: string;
  expiresIn: string; // e.g., "15 minutes"
}

// Order Confirmation Email
export interface HireConfirmationEmailContext extends EmailContext {
  orderId: string;
  orderDate: string; // ISO string or formatted date
  orderTotal: string; // e.g., "$49.99"
  shippingAddress: string;
  items: {
    name: string;
    quantity: number;
    price: string;
  }[];
  orderDetailsUrl: string;
}

// Shipping Notification Email
export interface ShippingNotificationEmailContext extends EmailContext {
  trackingNumber: string;
  carrier: string; // e.g., "DHL", "UPS"
  estimatedDelivery: string; // e.g., "June 25, 2025"
  shippingAddress: string;
  trackingUrl: string;
}

// Promotional Email
export interface PromotionalEmailContext extends EmailContext {
  offerTitle: string;
  offerDetails: string;
  discountCode?: string;
  validUntil: string; // e.g., "June 30, 2025"
  shopUrl: string;
}

// General Email Template
export interface EmailTemplate {
  subject: string;
  template: string; // Template file name or key
  context: EmailContext;
}
