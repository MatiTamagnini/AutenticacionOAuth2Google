import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

export interface GoogleUserData {
  googleId: string;
  email: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(data: GoogleUserData) {
    const byGoogleId = await this.prisma.user.findFirst({
      where: { googleId: data.googleId },
    });
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: data.googleId,
          name: byEmail.name ?? data.name,
          avatar: byEmail.avatar ?? data.avatar,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        provider: 'google',
      },
    });
  }

    login(user: User) {
    const { password: _password, ...safeUser } = user;
    const payload = { sub: safeUser.id, email: safeUser.email, name: safeUser.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}