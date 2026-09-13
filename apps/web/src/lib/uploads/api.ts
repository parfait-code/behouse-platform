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
