import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import { resolve } from "path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(resolve("."));

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run db:verify-login-env -- <your-password>");
  process.exit(1);
}

const b64 = process.env.AUTH_USER_PASSWORD_HASH_B64?.trim();
const email = process.env.AUTH_USER_EMAIL?.trim();
const secret = process.env.AUTH_SECRET?.trim();

if (!email) console.error("Missing AUTH_USER_EMAIL");
if (!secret) console.error("Missing AUTH_SECRET");
if (!b64) console.error("Missing AUTH_USER_PASSWORD_HASH_B64");

let hash = "";
try {
  hash = Buffer.from(b64 ?? "", "base64").toString("utf8");
} catch {
  console.error("AUTH_USER_PASSWORD_HASH_B64 is not valid base64");
  process.exit(1);
}

console.log("AUTH_USER_EMAIL:", email ?? "(missing)");
console.log("AUTH_SECRET set:", Boolean(secret));
console.log("Hash looks like bcrypt:", hash.startsWith("$2b$"));
console.log("Password matches hash:", await bcrypt.compare(password, hash));
