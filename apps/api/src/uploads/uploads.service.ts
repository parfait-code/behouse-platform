import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { RequestPresignedUploadDto } from "./dto/request-presigned-upload.dto";

const PRESIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.getOrThrow<string>(
      "AWS_ENDPOINT_URL_S3",
    );
    this.bucketName = this.configService.getOrThrow<string>("S3_BUCKET_NAME");

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.configService.get<string>("AWS_REGION", "eu-central-1"),
      // Neon Object Storage n'accepte que l'adressage "path-style"
      // (endpoint/bucket/clé), contrairement à AWS S3 classique qui
      // utilise par défaut l'adressage "virtual-hosted-style"
      // (bucket.endpoint/clé) — voir doc Neon Storage, "S3 compatibility".
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.getOrThrow<string>(
          "AWS_SECRET_ACCESS_KEY",
        ),
      },
    });
  }

  /**
   * Génère une URL PUT pré-signée pour un upload direct navigateur -> Neon
   * Storage (le fichier ne transite jamais par notre backend).
   *
   * ⚠️ Prérequis côté infra : le bucket `behouse_storage` doit être
   * configuré en accès `public_read` dans le dashboard Neon (Object
   * Storage -> Buckets), sinon `publicUrl` renverra 403 en lecture.
   */
  async createPresignedUpload(
    agencyId: string,
    dto: RequestPresignedUploadDto,
  ): Promise<PresignedUploadResult> {
    const sanitizedFileName = dto.fileName
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-");

    const key = `agencies/${agencyId}/${dto.purpose.toLowerCase()}/${randomUUID()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    // Format d'URL publique "path-style" (voir doc Neon Storage,
    // "Public objects") — valable uniquement si le bucket est public_read.
    const publicUrl = `${this.endpoint}/${this.bucketName}/${key}`;

    return { uploadUrl, publicUrl, key };
  }
}
