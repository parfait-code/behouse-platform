import { API_URL } from '../config';

export type UploadPurpose = 'PROPERTY_PHOTO' | 'AGENCY_LOGO';

interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Upload direct navigateur -> Neon Storage : le fichier ne transite
 * jamais par notre backend (voir apps/api/src/uploads).
 */
export async function uploadFile(
  token: string,
  file: File,
  purpose: UploadPurpose,
): Promise<string> {
  const presignResponse = await fetch(`${API_URL}/agency/uploads/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      purpose,
    }),
  });

  if (!presignResponse.ok) {
    throw new Error("Impossible d'initialiser l'envoi du fichier.");
  }

  const { uploadUrl, publicUrl } =
    (await presignResponse.json()) as PresignedUploadResult;

  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadResult.ok) {
    throw new Error("Échec de l'envoi du fichier vers le stockage.");
  }

  return publicUrl;
}

/**
 * Upload plusieurs fichiers en parallèle — utilisé à la soumission d'un
 * formulaire (voir PropertyForm) plutôt qu'à la sélection : les fichiers
 * ne partent vers Neon Storage qu'au clic sur le bouton final, pour que
 * l'utilisateur puisse encore changer d'avis sur sa sélection avant.
 */
export async function uploadFiles(
  token: string,
  files: File[],
  purpose: UploadPurpose,
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(token, file, purpose)));
}
