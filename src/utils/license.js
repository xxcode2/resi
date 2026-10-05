import { LICENSE_HASHES } from "../constants/licenses";

// Key localStorage: menyimpan hash kode yang berhasil divalidasi, supaya
// pembeli tidak perlu mengetik ulang kode tiap kali membuka aplikasi.
const UNLOCKED_KEY = "xyzthermal:license-hash";

/**
 * Menormalkan input kode: huruf besar, tanpa spasi.
 * Pembeli bisa mengetik "resi-demo-abcd" atau " RESI-DEMO-ABCD " — dua-duanya
 * harus dianggap kode yang sama.
 */
export function normalizeCode(code) {
  return (code || "").trim().toUpperCase().replace(/\s+/g, "");
}

/** SHA-256 (hex) sebuah string, memakai Web Crypto bawaan browser. */
export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Memeriksa apakah sebuah kode akses valid (hash-nya ada di daftar).
 * @param {string} code - kode mentah dari input user
 * @returns {Promise<{ valid: boolean, hash: string }>}
 */
export async function verifyLicenseCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return { valid: false, hash: "" };
  const hash = await sha256Hex(normalized);
  return { valid: LICENSE_HASHES.includes(hash), hash };
}

/** Menyimpan hash kode yang sudah valid sebagai "tiket" di perangkat ini. */
export function storeUnlockedHash(hash) {
  try {
    localStorage.setItem(UNLOCKED_KEY, hash);
  } catch {
    // localStorage diblokir — tidak fatal, user cukup masukkan kode tiap sesi
  }
}

/**
 * Cek apakah perangkat ini pernah membuka akses dengan kode yang masih valid.
 * Hash di localStorage dicocokkan ulang terhadap daftar, jadi kalau Anda
 * mencabut kode pembeli lalu deploy ulang, tiket lama ikut tidak berlaku.
 */
export function hasStoredUnlock() {
  try {
    const hash = localStorage.getItem(UNLOCKED_KEY);
    return !!hash && LICENSE_HASHES.includes(hash);
  } catch {
    return false;
  }
}

/** Hapus tiket akses (mis. kalau user sengaja logout dari perangkatnya). */
export function clearStoredUnlock() {
  try {
    localStorage.removeItem(UNLOCKED_KEY);
  } catch {
    // abaikan
  }
}
