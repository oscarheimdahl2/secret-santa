export interface Blob {
  salt: string;
  iv: string;
  ct: string;
}

const ITERATIONS = 100_000;
const b64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const normalize = (pw: string) => pw.trim().normalize("NFC").toLowerCase();

async function deriveKey(password: string, salt: BufferSource) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normalize(password)), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

/** Tries every blob; returns the receiver's name, or null if the password matches none. */
export async function reveal(password: string, blobs: Blob[]): Promise<string | null> {
  for (const blob of blobs) {
    try {
      const key = await deriveKey(password, b64(blob.salt));
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(blob.iv) }, key, b64(blob.ct));
      return new TextDecoder().decode(plain);
    } catch {
      /* wrong password for this blob */
    }
  }
  return null;
}
