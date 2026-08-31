import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes, pbkdf2Sync, createCipheriv } from "node:crypto";
import path from "node:path";

const ITERATIONS = 250000;
const KEY_LEN = 32; // 256 bits

const PLAIN_PATH = path.resolve("secrets/roadmap.plain.json");
const OUT_PATH = path.resolve("src/data/roadmap.enc.json");

const passphrase = process.env.ROADMAP_PASSPHRASE || process.argv[2];

if (!passphrase) {
  console.error("사용법: node scripts/encrypt-roadmap.mjs <비밀번호>");
  console.error("       또는 ROADMAP_PASSPHRASE=<비밀번호> node scripts/encrypt-roadmap.mjs");
  process.exit(1);
}

if (!existsSync(PLAIN_PATH)) {
  console.error(`평문 소스가 없습니다: ${PLAIN_PATH}`);
  console.error("secrets/roadmap.plain.json 파일을 먼저 만들어주세요 (이 파일은 git에 커밋되지 않습니다).");
  process.exit(1);
}

const plaintext = readFileSync(PLAIN_PATH, "utf-8");
JSON.parse(plaintext); // fail fast if not valid JSON

const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LEN, "sha256");

const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
const authTag = cipher.getAuthTag();
const ciphertext = Buffer.concat([encrypted, authTag]); // WebCrypto AES-GCM expects tag appended to ciphertext

const output = {
  v: 1,
  iterations: ITERATIONS,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: ciphertext.toString("base64"),
};

writeFileSync(OUT_PATH, JSON.stringify(output));
console.log(`암호화 완료 -> ${OUT_PATH}`);
