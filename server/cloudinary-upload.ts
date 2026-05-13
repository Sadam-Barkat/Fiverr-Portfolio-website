import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  return Boolean(cloudName && apiKey && apiSecret);
}

export async function uploadDataUrlToCloudinary(dataUrl: string, slug: string, kind: string): Promise<string> {
  ensureConfigured();
  const folder = `portfolio-projects/${slug}`;
  const publicId = `${kind}-${randomUUID()}`;
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
  });
  const url = result.secure_url;
  if (!url) {
    throw new Error("Cloudinary upload returned no URL");
  }
  return url;
}
