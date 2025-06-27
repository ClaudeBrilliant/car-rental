/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  Logger,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';;
import { Permission } from 'src/auth/enums/permissions.enum';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiResponse } from 'src/common/interfaces/api-response/api-response';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';


@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.CREATE_USER)
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @RequirePermissions(Permission.READ_USER)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter by user role',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    this.logger.log(`Fetching users - Page: ${page}, Limit: ${limit}`);
    return this.usersService.findAllUsers(page, limit, search, role);
  }

  @Get('customers')
  @RequirePermissions(Permission.READ_USER)
  @ApiOperation({ summary: 'Get all customers' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    type: [UserResponseDto],
  })
  async findAllCustomers(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all customers');
    return this.usersService.findAllCustomers();
  }

  @Get('admins')
  @RequirePermissions(Permission.READ_USER)
  @ApiOperation({ summary: 'Get all admins' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Admins retrieved successfully',
    type: [UserResponseDto],
  })
  async findAllAdmins(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all admins');
    return this.usersService.findAllAdmins();
  }

  @Get('profile')
  @RequirePermissions(Permission.VIEW_PROFILE)
  @ApiOperation({ summary: 'Get current user profile' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  // async getCurrentUserProfile(@Request() req): Promise<UserResponseDto> {
  //   const userId = req.user.sub;
  //   this.logger.log(`Fetching profile for user: ${userId}`);
  //   return this.usersService.findOneUser(userId);
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<CurrentUserData>> {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Patch('profile')
  @RequirePermissions(Permission.UPDATE_PROFILE)
  @ApiOperation({ summary: 'Update current user profile' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  @ApiBody({ type: UpdateUserDto })

  // async updateCurrentUserProfile(
  //   @Request() req,
  //   @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  // ): Promise<UserResponseDto> {
  //   const userId = req.user.sub;
  //   this.logger.log(`Updating profile for user: ${userId}`);
  //   return this.usersService.updateUser(userId, updateUserDto);
  // }

  @Get('email/:email')
  @RequirePermissions(Permission.READ_USER)
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findUserByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    this.logger.log(`Fetching user by email: ${email}`);
    return this.usersService.findUserByEmail(email);
  }

  @Get(':id')
  @RequirePermissions(Permission.READ_USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOneUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    this.logger.log(`Fetching user by ID: ${id}`);
    return this.usersService.findOneUser(id);
  }

  @Patch('profile')
  @RequirePermissions(Permission.UPDATE_PROFILE)
  @ApiOperation({ summary: 'Update current user profile' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })

  @Patch(':id')
  @RequirePermissions(Permission.UPDATE_USER)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch('profile/change-password')
  @RequirePermissions(Permission.CHANGE_PASSWORD)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid password format',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Current password is incorrect',
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Request() req,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.sub;
    this.logger.log(`Changing password for user: ${userId}`);
    return this.usersService.changeUserPassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Password reset request processed',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Password reset request for email: ${resetPasswordDto.email}`);
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Patch(':id/profile-image')
  @RequirePermissions(Permission.UPDATE_PROFILE)
  @ApiOperation({ summary: 'Update user profile image' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Profile image updated successfully',
    type: UserResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateProfileImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() imageData: {
      profileImageId: string | null;
      profileImageUrl: string | null;
    },
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating profile image for user: ${id}`);
    return this.usersService.updateProfileImage(id, imageData);
  }

  @Delete(':id')
  @RequirePermissions(Permission.DELETE_USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete user with existing bookings',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting user: ${id}`);
    return this.usersService.deleteUser(id);
  }
}

