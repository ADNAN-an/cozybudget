/** Bcrypt hashes contain `$` which Next.js dotenv-expand strips — use B64 in .env */
export function getAuthPasswordHash(): string | undefined {
  const b64 = process.env.AUTH_USER_PASSWORD_HASH_B64;
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return process.env.AUTH_USER_PASSWORD_HASH;
}
