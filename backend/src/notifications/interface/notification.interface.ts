import { NotificationType } from 'generated/prisma';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any; // JSON data

  createdAt: Date;
}
