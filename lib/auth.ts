export const COOKIE_NAME = "hr_session";
export const MAX_AGE = 60 * 60 * 8; // 8 heures

const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(username: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "fallback-secret";
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(username));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${username}.${hex}`;
}

export async function verifySession(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const lastDot = cookie.lastIndexOf(".");
  if (lastDot === -1) return false;

  const username = cookie.slice(0, lastDot);
  const sigHex = cookie.slice(lastDot + 1);

  const secret = process.env.AUTH_SECRET ?? "fallback-secret";
  const key = await importKey(secret);

  const sigBytes = new Uint8Array(
    sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(username));
}
