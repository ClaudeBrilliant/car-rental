/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

import { JwtPayload } from './interfaces/jwt.interface';
import { AuthResponse, AuthUser } from './interfaces/auth.interface';

import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';

import { LoginDto } from './dto/login.dto';
import { EmailService } from 'services/mailer/email.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(CreateUserDto: CreateUserDto): Promise<AuthResponse> {
    try {
      try {
        await this.usersService.findUserByEmail(CreateUserDto.email);
        throw new ConflictException('User with this email already exists');
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
      }

      const user = await this.usersService.createUser({
        firstName: CreateUserDto.firstName,
        lastName: CreateUserDto.lastName,
        email: CreateUserDto.email,
        phone: CreateUserDto.phone,
        password: CreateUserDto.password,
        role: CreateUserDto.role || UserRole.CUSTOMER,
        isActive: true,
      });

      try {
        await this.emailService.sendWelcomeEmail(user.email, {
          name: `${user.firstName} ${user.lastName}`,
          loginUrl: 'http://localhost:3000/pages/login/login.html',
          supportEmail: 'support@clyde-hire.com',
          email: 'ebs362920@gmail.com',
          currentYear: new Date().getFullYear(),
        });
        console.log(`Welcome email would be sent to ${user.email}`);
      } catch (emailError) {
        console.warn(
          `Failed to send welcome email to ${user.email}:`,
          emailError.message,
        );
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.tokenService.generateToken(payload);

      await this.usersService.updateUserLastLogin(user.id);

      return {
        access_token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: new Date(),
        },
        message: 'Registration successful',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.usersService.findUserByEmail(loginDto.email);

      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      console.log(user);

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.tokenService.generateToken(payload);

      const response: AuthResponse = {
        access_token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin || new Date(),
        },
      };

      console.log(' Login successful for user:', user.email);
      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateToken(token: string): Promise<AuthUser> {
    try {
      const payload = this.tokenService.verifyToken(token);
      const user = await this.usersService.findOneUser(payload.sub);

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName, // ✅ Fixed - use firstName instead of user.name
        lastName: user.lastName, // ✅ Fixed - use lastName instead of user.name
        isActive: user.isActive,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.tokenService.verifyToken(token);
      const user = await this.usersService.findOneUser(payload.sub);

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.tokenService.generateToken(newPayload);

      await this.usersService.updateUserLastLogin(user.id);

      return { access_token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      await this.usersService.updateUserLastLogin(userId);

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const changePasswordDto = {
      userId,
      currentPassword,
      newPassword,
    };
    return this.usersService.changeUserPassword(
      userId,
      currentPassword,
      newPassword,
      changePasswordDto,
    );
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      let user;
      try {
        user = await this.usersService.findUserByEmail(email);
      } catch (error) {
        return {
          message:
            'If your email is registered, you will receive a password reset link.',
        };
      }

      if (!user.isActive) {
        return {
          message:
            'If your email is registered, you will receive a password reset link.',
        };
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const resetToken = this.tokenService.generateToken(payload);
      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(user.email, {
          name: `${user.firstName} ${user.lastName}`, // ✅ Fixed - combine firstName and lastName
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
          expiresIn: '1 hour',
          email: 'support@project-management.com',
        });
        console.log(`Password reset email would be sent to ${user.email}`);
      } catch (emailError) {
        console.warn(
          `Failed to send password reset email to ${user.email}:`,
          emailError.message,
        );
      }

      return {
        message:
          'If your email is registered, you will receive a password reset link.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to process password reset request',
      );
    }
  }
}
