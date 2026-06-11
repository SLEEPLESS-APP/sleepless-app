/**
 * Cloudinary storage service using unsigned upload preset
 */

export async function storagePut(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name missing");
  }

  const base64 = data.toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;
  const publicId = key.replace(/[^a-zA-Z0-9_-]/g, "_");

  const form = new FormData();
  form.append("file", dataUri);
  form.append("upload_preset", "sleepless_uploads");
  form.append("public_id", publicId);

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
