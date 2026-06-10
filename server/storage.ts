/**
 * Cloudinary storage service
 */

export async function storagePut(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials missing");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const publicId = key.replace(/[^a-zA-Z0-9_-]/g, "_");

  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  // Use data URI - most reliable for Cloudinary REST API
  const base64 = data.toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  const form = new FormData();
  form.append("file", dataUri);
  form.append("public_id", publicId);
  form.append("timestamp", timestamp.toString());
  form.append("api_key", apiKey);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const result = await response.json() as any;

  if (!response.ok || result.error) {
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(result.error ?? result)}`);
  }

  return {
    key: result.public_id,
    url: result.secure_url,
  };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("Cloudinary cloud name missing");
  return {
    key: relKey,
    url: `https://res.cloudinary.com/${cloudName}/image/upload/${relKey}`,
  };
}
