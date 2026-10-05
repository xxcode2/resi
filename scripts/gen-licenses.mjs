#!/usr/bin/env node
/**
 * Generator kode akses + hash SHA-256 untuk file src/constants/licenses.js.
 *
 * Pemakaian:
 *   node scripts/gen-licenses.mjs 100
 *     -> buat 100 kode acak baru (format RESI-XXXX-XXXX). Hasil:
 *        licenses/kode-<tanggal>.txt   = daftar kode (privat, buat catatan Anda)
 *        licenses/hashes-<tanggal>.js  = array LICENSE_HASHES (tempel ke licenses.js)
 *        Tambah --print kalau mau semuanya ikut tercetak ke terminal.
 *
 *   node scripts/gen-licenses.mjs --from kode.txt
 *     -> hash daftar kode yang sudah Anda tulis sendiri (satu per baris)
 *
 * Catatan: input user dinormalkan dengan uppercase + buang spasi di browser,
 * jadi hash di sini dihitung dari bentuk yang sudah dinormalkan juga.
 */
import { createHash, randomInt } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Tanpa 0/O/1/I/L/U supaya tidak ambigu saat diketik/dibaca lewat chat
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomBlock(len) {
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

function normalize(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function sha256Hex(text) {
  return createHash("sha256").update(text).digest("hex");
}

function generateCodes(count) {
  const seen = new Set();
  const codes = [];
  while (codes.length < count) {
    const code = `RESI-${randomBlock(4)}-${randomBlock(4)}`;
    if (seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return codes;
}

const arg = process.argv[2];
if (!arg) {
  console.error('Pemakaian: node scripts/gen-licenses.mjs <jumlah> | --from <file>');
  process.exit(1);
}

let codes;
if (arg === "--from") {
  const file = process.argv[3];
  if (!file) {
    console.error("Beri path file daftar kode, cth: --from kode.txt");
    process.exit(1);
  }
  codes = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map(normalize)
    .filter(Boolean);
} else {
  const count = parseInt(arg, 10);
  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    console.error("Jumlah harus angka 1-10000, cth: node scripts/gen-licenses.mjs 100");
    process.exit(1);
  }
  codes = generateCodes(count);
}

const entries = codes.map((code) => ({ code: normalize(code), hash: sha256Hex(normalize(code)) }));

// Simpan daftar kode asli ke file privat (di-gitignore, tidak ikut ter-deploy),
// supaya tidak hilang saat terminal ditutup & bisa dicari lagi saat ada yang beli.
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
mkdirSync(join(process.cwd(), "licenses"), { recursive: true });
const outFile = join(process.cwd(), "licenses", `kode-${stamp}.txt`);
const body = [
  `# Daftar kode akses XYZ Thermal — dibuat ${new Date().toLocaleString("id-ID")}`,
  `# TOTAL: ${entries.length} kode. BAGIKAN 1 BARIS KE 1 PEMBELI. JANGAN disebar / JANGAN di-commit.`,
  `# Kolom: <kode>  <hash>
#`,
  ...entries.map(({ code, hash }) => `${code}  ${hash}`),
  "",
].join("\n");
writeFileSync(outFile, body, "utf8");

// 2) Array hash juga ditulis ke file, biar tidak perlu copy-paste dari terminal
//    (jumlah ribu kode bikin output stdout tidak terbaca).
const hashFile = join(process.cwd(), "licenses", `hashes-${stamp}.js`);
writeFileSync(
  hashFile,
  ["// Salin isi array ini ke src/constants/licenses.js lalu deploy.", "export const LICENSE_HASHES = [",
    ...entries.map(({ hash }) => `  "${hash}",`),
    "];", ""].join("\n"),
  "utf8"
);

// 3) Ringkasan singkat di terminal — daftar lengkap ada di file. Pakai --print
//    kalau memang mau mencetak semuanya ke stdout.
if (process.argv.includes("--print")) {
  console.log("=== DAFTAR KODE (bagikan 1 kode ke 1 pembeli, JANGAN disebar) ===");
  for (const { code } of entries) console.log(code);
  console.log("\n=== LICENSE_HASHES (sudah disimpan di hashes-<tanggal>.js) ===");
  console.log("export const LICENSE_HASHES = [");
  for (const { hash } of entries) console.log(`  "${hash}",`);
  console.log("];");
} else {
  console.log(`✓ ${entries.length} kode dibuat.`);
  console.log("  5 kode pertama:");
  for (const { code } of entries.slice(0, 5)) console.log(`    ${code}`);
  console.log("  (tambah --print di akhir command kalau mau cetak semuanya ke terminal)");
}

console.log(`\n✓ KODE ASLI (buat notepad Anda):        ${outFile}`);
console.log(`✓ ARRAY HASH siap tempel:              ${hashFile}`);
console.log("  (folder licenses/ sudah di-gitignore, tidak akan ke-deploy ke Vercel)");
