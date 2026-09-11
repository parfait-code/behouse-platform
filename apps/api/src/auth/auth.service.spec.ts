import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthMethod, User, UserRole } from "@prisma/client";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

// Mock typé de l'utilisateur retourné par Prisma — évite tout `any`.
const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "jane.doe@example.com",
  phone: null,
  passwordHash: "hashed-password",
  googleId: null,
  authMethod: AuthMethod.EMAIL_PASSWORD,
  role: UserRole.TENANT,
  firstName: "Jane",
  lastName: "Doe",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, "findByEmail" | "create" | "toPublicUser">
  >;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      toPublicUser: jest.fn((user: User) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authMethod: user.authMethod,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue("signed-jwt-token") },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe("registerWithEmail", () => {
    it("crée l'utilisateur et renvoie un access token si l'email est libre", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const createdUser = buildUser();
      usersService.create.mockResolvedValue(createdUser);

      const result = await authService.registerWithEmail({
        email: "jane.doe@example.com",
        password: "S3cur3Password!",
        firstName: "Jane",
        lastName: "Doe",
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "jane.doe@example.com",
          role: UserRole.TENANT,
          authMethod: AuthMethod.EMAIL_PASSWORD,
        }),
      );
      expect(result.accessToken).toBe("signed-jwt-token");
      expect(result.user.email).toBe("jane.doe@example.com");
    });

    it("rejette si un compte existe déjà avec cet email", async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        authService.registerWithEmail({
          email: "jane.doe@example.com",
          password: "S3cur3Password!",
          firstName: "Jane",
          lastName: "Doe",
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe("loginWithEmail", () => {
    it("rejette si le mot de passe est incorrect", async () => {
      const user = buildUser({
        passwordHash: await bcrypt.hash("correct-password", 10),
      });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        authService.loginWithEmail({
          email: "jane.doe@example.com",
          password: "wrong-password",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("renvoie un access token si le mot de passe est correct", async () => {
      const user = buildUser({
        passwordHash: await bcrypt.hash("correct-password", 10),
      });
      usersService.findByEmail.mockResolvedValue(user);

      const result = await authService.loginWithEmail({
        email: "jane.doe@example.com",
        password: "correct-password",
      });

      expect(result.accessToken).toBe("signed-jwt-token");
    });
  });
});
