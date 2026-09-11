import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { AuthService, AuthResult } from "./auth.service";
import { RegisterEmailDto } from "./dto/register-email.dto";
import { RegisterPhoneDto } from "./dto/register-phone.dto";
import { LoginEmailDto } from "./dto/login-email.dto";
import { LoginPhoneDto } from "./dto/login-phone.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { PublicUser } from "../users/user.types";
import { UsersService } from "../users/users.service";
import { User } from "@prisma/client";
import { AuthenticatedRequest } from "./interfaces/authenticated-request.interface";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // --- Méthode 1 : email + mot de passe ---

  @Post("register/email")
  registerWithEmail(@Body() dto: RegisterEmailDto): Promise<AuthResult> {
    return this.authService.registerWithEmail(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login/email")
  loginWithEmail(@Body() dto: LoginEmailDto): Promise<AuthResult> {
    return this.authService.loginWithEmail(dto);
  }

  // --- Méthode 2 : téléphone + mot de passe ---

  @Post("register/phone")
  registerWithPhone(@Body() dto: RegisterPhoneDto): Promise<AuthResult> {
    return this.authService.registerWithPhone(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login/phone")
  loginWithPhone(@Body() dto: LoginPhoneDto): Promise<AuthResult> {
    return this.authService.loginWithPhone(dto);
  }

  // --- Méthode 3 : Google OAuth ---

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth(): void {
    // Redirection vers Google gérée automatiquement par GoogleAuthGuard/Passport.
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): void {
    const { accessToken } = this.authService.buildAuthResult(req.user);
    const frontendUrl = this.configService.getOrThrow<string>("FRONTEND_URL");
    // Le frontend récupère le token depuis les paramètres de l'URL de retour
    // et l'enregistre côté client (voir apps/web, à implémenter avec ce module).
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  // --- Profil courant ---

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User): PublicUser {
    return this.usersService.toPublicUser(user);
  }
}
