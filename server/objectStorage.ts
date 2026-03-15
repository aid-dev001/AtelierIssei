import { Client } from "@replit/object-storage";

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    client = new Client();
  }
  return client;
}

export async function uploadToStorage(filename: string, buffer: Buffer, mimeType: string): Promise<boolean> {
  try {
    const storageClient = getClient();
    const result = await storageClient.uploadFromBytes(`artworks/${filename}`, buffer);
    if (!result.ok) {
      console.error("Object Storage upload error:", result.error);
      return false;
    }
    console.log(`Uploaded to Object Storage: artworks/${filename}`);
    return true;
  } catch (error) {
    console.error("Object Storage upload failed:", error);
    return false;
  }
}

export async function downloadFromStorage(filename: string): Promise<Buffer | null> {
  try {
    const storageClient = getClient();
    const result = await storageClient.downloadAsBytes(`artworks/${filename}`);
    if (!result.ok) {
      return null;
    }
    return result.value[0];
  } catch (error) {
    console.error("Object Storage download failed:", error);
    return null;
  }
}
