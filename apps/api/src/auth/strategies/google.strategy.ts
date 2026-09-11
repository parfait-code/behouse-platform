import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { AuthMethod, User, UserRole } from "@prisma/client";
import { UsersService } from "../../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_OAUTH_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>(
        "GOOGLE_OAUTH_CLIENT_SECRET",
      ),
      callbackURL: configService.getOrThrow<string>(
        "GOOGLE_OAUTH_CALLBACK_URL",
      ),
      scope: ["email", "profile"],
    });
  }

  /**
   * Appelé par Passport une fois le consentement Google obtenu.
   * Crée l'utilisateur au premier login, le retrouve ensuite via googleId.
   * Le rôle par défaut est TENANT : ce flux sert l'inscription/connexion
   * locataire côté site public (voir cahier des charges, section 6.5).
   * La création de comptes AGENCY_ADMIN/AGENT passe par l'onboarding
   * agence (epic E2), pas par ce flux public.
   */
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName ?? profile.displayName;
      const lastName = profile.name?.familyName ?? "";

      let user: User | null = await this.usersService.findByGoogleId(
        profile.id,
      );

      if (!user && email) {
        // Un compte existe peut-être déjà via email/mot de passe :
        // on le relie à Google plutôt que d'en créer un doublon.
        user = await this.usersService.findByEmail(email);
      }

      if (!user) {
        user = await this.usersService.create({
          googleId: profile.id,
          email: email ?? undefined,
          firstName,
          lastName,
          role: UserRole.TENANT,
          authMethod: AuthMethod.GOOGLE,
        });
      }

      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
