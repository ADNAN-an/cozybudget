import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run db:hash-password -- <your-password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const b64 = Buffer.from(hash, "utf8").toString("base64");
console.log("\nAdd this to your .env (use B64 — Next.js breaks plain bcrypt hashes):\n");
console.log(`AUTH_USER_PASSWORD_HASH_B64="${b64}"\n`);
