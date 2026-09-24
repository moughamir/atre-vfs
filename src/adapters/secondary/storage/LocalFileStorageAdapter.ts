// ── Local File Storage Adapter ────────────────────────────────
// Implements FileStoragePort using the local filesystem.
// Can be swapped for S3, Cloudinary, etc. by implementing the same interface.

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { FileStoragePort } from "@/domain/ports";
import type { FileStorageRequest, FileStorageResult } from "@/domain/entities";

export class LocalFileStorageAdapter implements FileStoragePort {
  readonly providerId = "local";

  async save(request: FileStorageRequest): Promise<FileStorageResult> {
    const fullPath = path.join(process.cwd(), "public", request.directory, request.filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, request.buffer);
    return {
      url: `/${request.directory}/${request.filename}`,
      path: fullPath,
    };
  }

  async saveBase64(base64Data: string, directory: string, prefix: string): Promise<FileStorageResult> {
    // Strip data URL prefix if present
    const matches = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "png";

    if (matches) {
      const mime = matches[1];
      ext = mime.split("/")[1].replace("jpeg", "jpg").replace("svg+xml", "svg");
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const hash = crypto.randomBytes(8).toString("hex");
    const safePrefix = prefix
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 20);
    const filename = `${safePrefix}-${Date.now()}-${hash}.${ext}`;

    return this.save({ buffer, directory, filename });
  }
}
