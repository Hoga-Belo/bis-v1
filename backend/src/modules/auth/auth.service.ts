import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // Placeholder implementation - will be replaced with actual user validation
    const { username, password } = loginDto;

    // TODO: Replace with actual user lookup and password validation
    if (username === 'admin' && password === 'admin123') {
      const payload = {
        sub: '1',
        username: username,
        roles: ['admin'],
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: '1',
          nik: username,
          nama: 'Administrator',
          roles: ['admin'],
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async validateUser(payload: { sub: string; username: string; roles: string[] }) {
    // TODO: Implement actual user validation from database
    // For now, return user data matching the frontend User interface
    return {
      id: payload.sub,
      nik: payload.username,
      nama: payload.username === 'admin' ? 'Administrator' : payload.username,
      roles: payload.roles,
    };
  }
}