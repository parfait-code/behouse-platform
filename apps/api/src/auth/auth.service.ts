import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthMethod, User, UserRole } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { PublicUser } from "../users/user.types";
import { RegisterEmailDto } from "./dto/register-email.dto";
import { RegisterPhoneDto } from "./dto/register-phone.dto";
import { LoginEmailDto } from "./dto/login-email.dto";
import { LoginPhoneDto } from "./dto/login-phone.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

const BCRYPT_SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerWithEmail(dto: RegisterEmailDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Un compte existe déjà avec cet email.");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.TENANT,
      authMethod: AuthMethod.EMAIL_PASSWORD,
    });

    return this.buildAuthResult(user);
  }

  async registerWithPhone(dto: RegisterPhoneDto): Promise<AuthResult> {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException(
        "Un compte existe déjà avec ce numéro de téléphone.",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersService.create({
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.TENANT,
      authMethod: AuthMethod.PHONE_PASSWORD,
    });

    return this.buildAuthResult(user);
  }

  async loginWithEmail(dto: LoginEmailDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    await this.assertValidPassword(user, dto.password);
    return this.buildAuthResult(user as User);
  }

  async loginWithPhone(dto: LoginPhoneDto): Promise<AuthResult> {
    const user = await this.usersService.findByPhone(dto.phone);
    await this.assertValidPassword(user, dto.password);
    return this.buildAuthResult(user as User);
  }

  /**
   * Émet un token pour un utilisateur déjà authentifié par un moyen tiers
   * (ex: callback Google OAuth, voir GoogleStrategy + AuthController).
   */
  buildAuthResult(user: User): AuthResult {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.toPublicUser(user),
    };
  }

  /**
   * Vérifie le mot de passe sans révéler si c'est l'identifiant ou le mot
   * de passe qui est erroné (bonne pratique de sécurité).
   */
  private async assertValidPassword(
    user: User | null,
    plainPassword: string,
  ): Promise<void> {
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Identifiants invalides.");
    }

    const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Identifiants invalides.");
    }
  }
}
