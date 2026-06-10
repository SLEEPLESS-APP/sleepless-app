/**
 * Cloudinary storage service
 * Replaces the Manus built-in storage proxy
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
    throw new Error("Cloudinary credentials missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }

  // Create signature for authenticated upload
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  
  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  // Build multipart form
  const base64 = data.toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  const formData = new URLSearchParams();
  formData.append("file", dataUri);
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const result = await response.json() as { secure_url: string; public_id: string };
  
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
