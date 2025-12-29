import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User, RefreshToken } from '../../entities/user-access';

const logger = new Logger('AuthService');

export interface AuthenticatedUser {
  id: string;
  nik: string;
  employeeId: string | null;
  roles: string[];
  permissions: string[];
  isFirstLogin: boolean;
  lastLoginAt: Date | null;
}

export interface JwtPayload {
  sub: string;
  nik: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Validate user credentials against database
   * @param nik - User NIK
   * @param password - Plain text password
   * @returns User entity with roles and permissions
   */
  async validateCredentials(nik: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { nik, isActive: true, deletedAt: IsNull() },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Generate a refresh token and store it in the database
   * @param userId - User ID
   * @param userAgent - User agent string
   * @param ipAddress - IP address
   * @returns Refresh token string
   */
  private async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = uuidv4() + '-' + uuidv4(); // Generate unique token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  /**
   * Login user and return JWT token with refresh token
   * @param loginDto - Login credentials
   * @param userAgent - User agent string
   * @param ipAddress - IP address
   * @returns Access token, refresh token and user info
   */
  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const { nik, password } = loginDto;

    logger.log(`[LOGIN] Starting login for NIK: ${nik}`);

    try {
      // Validate credentials and get user from database
      logger.log(`[LOGIN] Step 1: Validating credentials`);
      const user = await this.validateCredentials(nik, password);
      logger.log(`[LOGIN] Step 1 complete: User found with ID ${user.id}`);

      // Extract roles from user relations
      logger.log(`[LOGIN] Step 2: Extracting roles`);
      const roles = user.userRoles.map((ur) => ur.role.code);
      logger.log(`[LOGIN] Step 2 complete: Found ${roles.length} roles`);

      // Extract permissions from nested relations
      logger.log(`[LOGIN] Step 3: Extracting permissions`);
      const permissionsSet = new Set<string>();
      user.userRoles.forEach((ur) => {
        ur.role.rolePermissions?.forEach((rp) => {
          if (rp.permission?.code) {
            permissionsSet.add(rp.permission.code);
          }
        });
      });
      const permissions = Array.from(permissionsSet);
      logger.log(`[LOGIN] Step 3 complete: Found ${permissions.length} permissions`);

      // Build JWT payload
      logger.log(`[LOGIN] Step 4: Building JWT payload`);
      const payload: JwtPayload = {
        sub: user.id,
        nik: user.nik,
        roles,
        permissions,
      };
      logger.log(`[LOGIN] Step 4 complete: Payload built`);

      logger.log(`[LOGIN] Step 5: Signing JWT`);
      const accessToken = this.jwtService.sign(payload);
      logger.log(`[LOGIN] Step 5 complete: JWT signed`);

      // Generate refresh token
      logger.log(`[LOGIN] Step 6: Generating refresh token`);
      const refreshToken = await this.generateRefreshToken(
        user.id,
        userAgent,
        ipAddress,
      );
      logger.log(`[LOGIN] Step 6 complete: Refresh token generated`);

      // Update lastLoginAt timestamp
      logger.log(`[LOGIN] Step 7: Updating lastLoginAt`);
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });
      logger.log(`[LOGIN] Step 7 complete: lastLoginAt updated`);

      logger.log(`[LOGIN] Login successful for NIK: ${nik}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nik: user.nik,
          employeeId: user.employeeId,
          roles,
          permissions,
          isFirstLogin: user.isFirstLogin,
          lastLoginAt: new Date(),
        },
      };
    } catch (error) {
      logger.error(`[LOGIN] Error during login: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate user by ID for JWT strategy
   * @param userId - User ID from JWT payload
   * @returns User with roles and permissions
   */
  async validateUser(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true, deletedAt: IsNull() },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!user) {
      return null;
    }

    // Extract roles
    const roles = user.userRoles.map((ur) => ur.role.code);

    // Extract permissions
    const permissionsSet = new Set<string>();
    user.userRoles.forEach((ur) => {
      ur.role.rolePermissions?.forEach((rp) => {
        if (rp.permission?.code) {
          permissionsSet.add(rp.permission.code);
        }
      });
    });
    const permissions = Array.from(permissionsSet);

    return {
      id: user.id,
      nik: user.nik,
      employeeId: user.employeeId,
      roles,
      permissions,
      isFirstLogin: user.isFirstLogin,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Refresh access token using refresh token
   * @param dto - Refresh token DTO
   * @returns New access token and refresh token
   */
  async refresh(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: dto.refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      // Revoke expired token
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Get user with roles and permissions
    const user = await this.validateUser(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const payload: JwtPayload = {
      sub: user.id,
      nik: user.nik,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate new refresh token
    const newRefreshToken = await this.generateRefreshToken(
      user.id,
      storedToken.userAgent ?? undefined,
      storedToken.ipAddress ?? undefined,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by revoking refresh token
   * @param refreshToken - Refresh token to revoke
   * @returns Success message
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Revoke all refresh tokens for a user (for security purposes)
   * @param userId - User ID
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param dto - Change password DTO
   * @returns Success message
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Jika bukan first login, validasi old password
    if (!user.isFirstLogin) {
      if (!dto.oldPassword) {
        throw new BadRequestException('Old password is required');
      }

      const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);

      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Old password is incorrect');
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update user
    user.passwordHash = newPasswordHash;
    user.isFirstLogin = false;
    user.updatedBy = userId;

    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
