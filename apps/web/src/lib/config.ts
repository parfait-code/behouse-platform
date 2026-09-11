/**
 * URL de base de l'API Behouse (NestJS), préfixe /api inclus.
 *
 * En production : https://behouse-platform.onrender.com/api
 * (définie via NEXT_PUBLIC_API_URL dans les variables d'environnement Vercel).
 */
export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
