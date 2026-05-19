import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@bruce/logger';

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function isMissingBucketError(error: unknown): boolean {
  const err = error as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
  const code = err.name ?? err.Code;
  return err.$metadata?.httpStatusCode === 404 || code === 'NotFound' || code === 'NoSuchBucket';
}

export class StorageClient {
  private s3: S3Client;
  private bucket: string;
  private bucketReady: Promise<void> | null = null;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.s3 = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  private makeKey(module: string, accountId: string, resourceId: string, filename: string): string {
    return `${module}/${accountId}/${resourceId}/${filename}`;
  }

  private async ensureBucket(): Promise<void> {
    if (process.env.STORAGE_AUTO_CREATE_BUCKET === 'false') {
      return;
    }
    if (!this.bucketReady) {
      this.bucketReady = this.createBucketIfMissing();
    }
    await this.bucketReady;
  }

  private async createBucketIfMissing(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return;
    } catch (error) {
      if (!isMissingBucketError(error)) {
        throw error;
      }
    }

    try {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      logger.info({ bucket: this.bucket }, 'Created storage bucket');
    } catch (error) {
      const name = (error as { name?: string }).name;
      if (name === 'BucketAlreadyOwnedByYou' || name === 'BucketAlreadyExists') {
        return;
      }
      throw error;
    }
  }

  async upload(
    module: string,
    accountId: string,
    resourceId: string,
    filename: string,
    content: Buffer | string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    const key = this.makeKey(module, accountId, resourceId, filename);

    try {
      await this.ensureBucket();
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: typeof content === 'string' ? content : content,
          ContentType: contentType,
        })
      );

      logger.info({ key }, 'File uploaded to storage');
      return key;
    } catch (error) {
      logger.error({ error, key }, 'Failed to upload file');
      throw error;
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (error) {
      logger.error({ error, key }, 'Failed to download file');
      throw error;
    }
  }

  async getSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: expirationSeconds });
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      logger.info({ key }, 'File deleted from storage');
    } catch (error) {
      logger.error({ error, key }, 'Failed to delete file');
      throw error;
    }
  }
}

let instance: StorageClient | undefined;

export function getStorageClient(): StorageClient {
  if (!instance) {
    instance = new StorageClient({
      bucket: process.env.STORAGE_BUCKET || 'bruce',
      region: process.env.STORAGE_REGION || 'us-east-1',
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
    });
  }
  return instance;
}
