/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable @typescript-eslint/no-namespace */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Permission } from '../enums/permissions.enum';
import { PermissionsService } from '../services/permission.service';

@Injectable()
export class PermissionsMiddleware implements NestMiddleware {
  constructor(private permissionsService: PermissionsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
      req.userPermissions = this.permissionsService.getPermissionsForRole(
        req.user.role,
      );
    }
    next();
  }
}

declare global {
  namespace Express {
    interface Request {
      userPermissions?: Permission[];
    }
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      firstName?: string;
      lastName: string;
    }

    interface Request {
      user?: User;
      userPermissions?: Permission[];
    }
  }
}
