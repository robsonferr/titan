export const SESSION_COOKIE_NAME = "titan_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  sub: string;
  exp: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSessionToken(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0 || dotIndex === token.length - 1) {
    return null;
  }

  const body = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  let signatureBytes: Uint8Array;
  let bodyBytes: Uint8Array;
  try {
    signatureBytes = base64UrlDecode(sig);
    bodyBytes = base64UrlDecode(body);
  } catch {
    return null;
  }

  const key = await importHmacKey(secret);
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );

  if (!constantTimeEqual(signatureBytes, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(bodyBytes)) as
      | SessionPayload
      | null;

    if (
      !payload ||
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function constantTimeEqualBytes(
  a: Uint8Array,
  b: Uint8Array,
): boolean {
  return constantTimeEqual(a, b);
}
