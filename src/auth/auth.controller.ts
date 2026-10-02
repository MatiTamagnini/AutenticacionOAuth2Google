import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Redirige a la pantalla de login de Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  // Google vuelve acá; devolvemos el JWT
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }
    // Ruta privada: requiere "Authorization: Bearer <token>"
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}