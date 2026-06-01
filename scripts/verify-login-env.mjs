import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(resolve("."));

const b64 = process.env.AUTH_USER_PASSWORD_HASH_B64;
const hash = Buffer.from(b64, "base64").toString("utf8");
const ok = await bcrypt.compare("159951", hash);
console.log("hash starts with $2b:", hash.startsWith("$2b"));
console.log("password 159951 matches:", ok);
