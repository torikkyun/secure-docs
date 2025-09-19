import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload = { id: user.id };
    return this.jwtService.signAsync(payload);
  }
}
