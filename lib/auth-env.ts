function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Bcrypt hashes contain `$` which Next.js dotenv-expand strips — use B64 in .env */
export function getAuthPasswordHash(): string | undefined {
  const b64 = normalizeEnvValue(process.env.AUTH_USER_PASSWORD_HASH_B64);
  if (b64) {
    try {
      const hash = Buffer.from(b64, "base64").toString("utf8");
      if (hash.startsWith("$2")) return hash;
      console.error(
        "AUTH_USER_PASSWORD_HASH_B64 decoded but is not a bcrypt hash — re-run npm run db:hash-password"
      );
    } catch {
      console.error("AUTH_USER_PASSWORD_HASH_B64 is not valid base64");
    }
  }

  const plain = normalizeEnvValue(process.env.AUTH_USER_PASSWORD_HASH);
  if (plain?.startsWith("$2")) return plain;

  return undefined;
}

export function getAuthEnvStatus() {
  const email = normalizeEnvValue(process.env.AUTH_USER_EMAIL);
  const secret = normalizeEnvValue(process.env.AUTH_SECRET);
  const hash = getAuthPasswordHash();
  return {
    hasEmail: Boolean(email),
    hasSecret: Boolean(secret),
    hasPasswordHash: Boolean(hash),
  };
}
