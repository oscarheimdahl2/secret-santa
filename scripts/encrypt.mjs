// Usage: npm run encrypt
// Reads secrets.local.json (UNTRACKED: password -> who they give to)
// and writes src/data.enc.json (committed, encrypted with each password).
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 100_000;
const normalize = (pw) => pw.trim().normalize("NFC").toLowerCase();
const b64 = (u8) => Buffer.from(u8).toString("base64");

const secrets = JSON.parse(readFileSync("secrets.local.json", "utf8"));
const blobs = [];

for (const [password, receiver] of Object.entries(secrets)) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normalize(password)), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(receiver));
  blobs.push({ salt: b64(salt), iv: b64(iv), ct: b64(ct) });
}

blobs.sort(() => Math.random() - 0.5);
writeFileSync("src/data.enc.json", JSON.stringify(blobs, null, 2) + "\n");
console.log(`Encrypted ${blobs.length} entries -> src/data.enc.json`);
