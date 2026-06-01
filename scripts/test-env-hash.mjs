import { readFileSync, writeFileSync } from "fs";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { resolve } from "path";
import bcrypt from "bcryptjs";

const hash =
  "$2b$12$tTZGimK3hxt0Hf.PeRFYb.S5dGFxz1wfrKYIWsCsUspFXR54eZbNe";

const variants = {
  escaped: `AUTH_USER_PASSWORD_HASH="\\$2b\\$12\\$tTZGimK3hxt0Hf.PeRFYb.S5dGFxz1wfrKYIWsCsUspFXR54eZbNe"`,
  doubled: `AUTH_USER_PASSWORD_HASH="$$2b$$12$$tTZGimK3hxt0Hf.PeRFYb.S5dGFxz1wfrKYIWsCsUspFXR54eZbNe"`,
  unquoted: `AUTH_USER_PASSWORD_HASH=${hash}`,
};

for (const [name, line] of Object.entries(variants)) {
  writeFileSync(".env.testhash", line + "\n");
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("AUTH_USER")) delete process.env[k];
  }
  loadEnvConfig(resolve("."), true, undefined, ".env.testhash");
  const loaded = process.env.AUTH_USER_PASSWORD_HASH;
  const ok = loaded === hash;
  const match = loaded ? await bcrypt.compare("159951", loaded) : false;
  console.log(name, { ok, len: loaded?.length, match, loaded: loaded?.slice(0, 20) });
}
