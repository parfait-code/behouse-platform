import { Injectable } from "@nestjs/common";
import { AuthMethod, User, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PublicUser } from "./user.types";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  role: UserRole;
  authMethod: AuthMethod;
  email?: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }

  /**
   * Retire les champs sensibles (passwordHash, googleId) avant renvoi au client.
   */
  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: user.authMethod,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
