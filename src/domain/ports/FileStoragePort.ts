// ── File Storage Port ───────────────────────────────────────────
// Defines the interface for saving files (uploaded images, generated images).
// Implementations: LocalFileStorageAdapter (current), (future: S3, Cloudinary, etc.)

import type { FileStorageRequest, FileStorageResult } from "../entities";

export interface FileStoragePort {
  /**
   * Save a file to the storage backend.
   * @param request - Buffer, directory, filename
   * @returns The public URL and internal path
   */
  save(request: FileStorageRequest): Promise<FileStorageResult>;

  /**
   * Save a base64-encoded image.
   * @param base64Data - Raw base64 string or data URL
   * @param directory - Target subdirectory
   * @param prefix - Filename prefix
   * @returns The public URL and internal path
   */
  saveBase64(base64Data: string, directory: string, prefix: string): Promise<FileStorageResult>;

  /** Storage provider identifier (e.g. "local", "s3") */
  readonly providerId: string;
}
