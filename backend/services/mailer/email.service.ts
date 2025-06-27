/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  WelcomeEmailContext,
  PasswordResetEmailContext,
  ShippingNotificationEmailContext,
  PromotionalEmailContext,
  EmailContext,
  HireConfirmationEmailContext,
} from './email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private getGlobalContext(extra: Record<string, any> = {}) {
    return {
      appName: this.configService.get<string>('APP_NAME') || 'Clyde Hire',
      year: new Date().getFullYear(),
      supportEmail:
        (this.configService.get<string>('SUPPORT_EMAIL') as string) ||
        'support@clydehire.com',
      ...extra,
    };
  }

  private async sendEmail(
    to: string | string[],
    subject: string,
    template: string,
    context: EmailContext,
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: this.getGlobalContext(context),
      });

      this.logger.log(
        `Email '${template}' sent to ${Array.isArray(to) ? to.join(', ') : to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send '${template}' to ${to}: ${error.message}`,
      );
      throw new InternalServerErrorException(`Email send failure: ${template}`);
    }
  }

  async sendWelcomeEmail(email: string, context: WelcomeEmailContext) {
    await this.sendEmail(
      email,
      `Welcome to Clyde-Hire, ${context.name}!`,
      'emails/welcome',
      context,
    );
  }

  async sendPasswordResetEmail(
    email: string,
    context: PasswordResetEmailContext,
  ) {
    await this.sendEmail(
      email,
      'Reset Your Password - Clyde-Hire',
      'emails/password-reset',
      context,
    );
  }

  async sendHireConfirmation(
    email: string,
    context: HireConfirmationEmailContext,
  ) {
    await this.sendEmail(
      email,
      `Order #${context.orderId} Confirmation`,
      'emails/order-confirmation',
      context,
    );
  }

  async sendShippingNotification(
    email: string,
    context: ShippingNotificationEmailContext,
  ) {
    await this.sendEmail(
      email,
      `Your Shopie Order is on the Way!`,
      'emails/shipping-notification',
      context,
    );
  }

  async sendPromotionalEmail(email: string, context: PromotionalEmailContext) {
    await this.sendEmail(email, context.offerTitle, 'emails/promo', context);
  }

  async sendTestEmail(email: string) {
    await this.sendEmail(email, 'Test Email from Shopie', 'emails/test', {
      name: 'Test',
      email,
      currentDate: new Date().toLocaleString(),
    });
  }
}
