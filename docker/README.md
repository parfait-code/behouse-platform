# Docker — Behouse

La conteneurisation du projet est **volontairement reportée à la fin du développement du MVP**
(décision actée — voir `Behouse_Documentation_Technique_et_Planning.md`, section 2).

Tant que ce dossier ne contient pas de `Dockerfile`, le développement se fait :
- **En local** : `npm install` puis `npm run dev:web` / `npm run dev:api` depuis la racine du monorepo.
- **En déploiement** : via les intégrations natives Vercel (frontend) et Render (backend), qui gèrent
  elles-mêmes leur propre build sans nécessiter de Dockerfile.

**Quand on dockerisera (prévu en fin de MVP), prévoir ici :**
- `apps/web/Dockerfile` (multi-stage build Next.js)
- `apps/api/Dockerfile` (multi-stage build NestJS + Prisma)
- `docker-compose.yml` à la racine pour un environnement de développement local tout-en-un
  (utile si l'équipe grandit et veut un environnement reproductible sans dépendre de Neon en dev).
