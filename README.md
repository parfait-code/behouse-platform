# Behouse — Monorepo

Plateforme de location de biens meublés multi-agences. Voir la documentation complète dans `docs/` :
- `docs/Behouse_Documentation_Projet.md` — vision, acteurs, périmètre
- `docs/Behouse_Cahier_Des_Charges_Fonctionnel.md` — spécifications fonctionnelles détaillées
- `docs/Behouse_Documentation_Technique_et_Planning.md` — stack technique et planning de développement

## Structure du monorepo

```
behouse-platform/
├── apps/
│   ├── web/     → Frontend Next.js (site public + dashboards) — déployé sur Vercel
│   └── api/     → Backend NestJS (API) — déployé sur Render
├── .github/workflows/  → CI (lint, build, test) pour web et api
├── render.yaml          → Blueprint de déploiement Render pour l'API
└── docker/               → Conteneurisation (à compléter en fin de MVP)
```

## Prérequis

- Node.js ≥ 20
- npm (le monorepo utilise les **npm workspaces**, pas besoin d'installer pnpm/yarn)
- Un compte Neon (base de données PostgreSQL `behouse_db` + stockage compatible S3)
- Un compte CinetPay (sandbox pour le développement)

## Installation

```bash
# Depuis la racine du monorepo
npm install
```

## Configuration des variables d'environnement

1. Copier `apps/api/.env.example` vers `apps/api/.env` et renseigner :
   - `DATABASE_URL` : la connexion **pooled** Neon (fournie dans votre dashboard Neon, onglet "Connection Details").
   - `DIRECT_DATABASE_URL` : la connexion **sans pooling** Neon (nécessaire pour les migrations Prisma).
   - `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` : identifiants Neon Storage (compatible S3), depuis l'onglet stockage de votre projet Neon.
   - Les identifiants CinetPay (sandbox pour commencer).
   - Un `JWT_SECRET` fort (générer avec `openssl rand -base64 32`).

2. Copier `apps/web/.env.example` vers `apps/web/.env.local` et renseigner l'URL de l'API et la clé Google Maps.

> ⚠️ **Ne jamais committer de fichier `.env` réel.** Ils sont exclus via `.gitignore`. En production, les variables sont saisies directement dans les dashboards Vercel et Render (voir `render.yaml`).

## Lancer le projet en local

```bash
# Génère le client Prisma et applique le schéma initial sur Neon
npm run prisma:generate
npm run prisma:migrate

# Backend (NestJS) — http://localhost:3001
npm run dev:api

# Frontend (Next.js) — http://localhost:3000
npm run dev:web
```

## Qualité de code

- **TypeScript strict** activé sur les deux applications (`tsconfig.json`).
- Le type `any` est **interdit par défaut** (`@typescript-eslint/no-explicit-any: error`) — à n'utiliser qu'en dernier recours, avec un commentaire expliquant pourquoi.
- `npm run lint:web` / `npm run lint:api` avant chaque commit.

## CI/CD

- **GitHub Actions** (`.github/workflows/`) : lint + build (+ tests pour l'API) à chaque push/PR sur `main`/`develop`, filtré par dossier modifié (`apps/web` ou `apps/api`).
- **Déploiement** : natif via les intégrations Git de **Vercel** (root directory : `apps/web`) et **Render** (via `render.yaml`, root directory : `apps/api`). Aucune action manuelle de déploiement nécessaire une fois les intégrations connectées au dépôt.

## Gestion de projet

Suivi des epics/tickets sur **Jira**. Les epics E1 à E11 du planning de développement (`Behouse_Documentation_Technique_et_Planning.md`, section 7.1) sont à recréer comme Epics Jira, avec les écrans du cahier des charges fonctionnel comme user stories associées.

## Prochaines étapes de développement (epic E1)

- [x] Initialisation du monorepo (web + api) et du CI/CD
- [ ] Connexion effective à Neon (DB + Storage) et première migration Prisma
- [ ] Mise en place de l'authentification (email/mdp, téléphone/mdp, Google OAuth)
- [ ] Premiers modules NestJS fonctionnels (Agencies, Auth)
