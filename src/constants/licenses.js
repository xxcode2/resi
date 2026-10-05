/**
 * Daftar SHA-256 hash dari kode akses yang valid, siap dipakai di App.
 *
 * Kode asli TIDAK disimpan di sini — hanya hash-nya, sehingga pembeli yang
 * membuka file ini tidak bisa membaca kode milik pembeli lain.
 *
 * Cara mengelola:
 *   1. Generate N kode acak + hash-nya sekaligus:
 *        node scripts/gen-licenses.mjs 100
 *   2. Salin array hash yang tercetak ke LICENSE_HASHES di bawah.
 *   3. Simpan daftar kode (kolom pertama) sebagai catatan Anda, bagikan
 *      satu kode ke satu pembeli.
 *
 * Untuk mencabut akses satu pembeli: generate ulang daftar tanpa kode tsb.
 */
export const LICENSE_HASHES = [
  // Kode demo: RESI-DEMO-ABCD (ganti dengan daftar Anda sendiri)
  "bb1294def0e1724b201e4f2b7323fd7cd261ef255c44de07f83c5a04c80cdd29",
];
