import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import Button from "./ui/Button";
import { verifyLicenseCode, storeUnlockedHash } from "../utils/license";

/**
 * Layar pengunci aplikasi. Pembeli harus memasukkan kode akses unik
 * (diberikan penjual) sebelum bisa memakai aplikasi. Kode diperiksa
 * sepenuhnya di browser dengan membandingkan SHA-256-nya terhadap daftar
 * hash di src/constants/licenses.js — tanpa server/database.
 */
export default function LicenseGate({ onUnlocked }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checking) return;
    setError(null);

    if (!code.trim()) {
      setError("Masukkan kode akses Anda terlebih dahulu.");
      return;
    }

    setChecking(true);
    try {
      const { valid, hash } = await verifyLicenseCode(code);
      if (valid) {
        storeUnlockedHash(hash);
        onUnlocked();
      } else {
        setError("Kode akses tidak valid. Periksa kembali atau hubungi penjual.");
      }
    } catch (err) {
      console.error("License verify error:", err);
      setError("Gagal memverifikasi kode. Pastikan halaman dibuka lewat HTTPS/localhost.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-100 p-6">
      <div className="w-full max-w-sm rounded-xl border border-ink-900/10 bg-white p-8 shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal/10">
          <Lock size={22} className="text-signal" />
        </div>
        <h1 className="mt-4 text-center font-display text-xl font-semibold text-ink-900">
          XYZ Thermal
        </h1>
        <p className="mt-1 text-center text-sm text-ink-500">
          Cetak resi marketplace langsung dari browser. Masukkan kode akses
          yang Anda terima untuk mulai menggunakan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="cth: RESI-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            className="w-full rounded-lg border border-ink-900/10 px-4 py-2.5 text-center font-mono text-sm uppercase tracking-widest text-ink-900 placeholder:text-ink-300 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal/20"
          />

          {error && (
            <p className="mt-3 rounded-lg bg-signal/5 px-3 py-2 text-center text-xs text-signal">
              {error}
            </p>
          )}

          <Button
            type="submit"
            icon={ShieldCheck}
            loading={checking}
            className="mt-4 w-full"
          >
            Buka Akses
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] text-ink-300">
          Kode tersimpan di perangkat ini — Anda hanya perlu memasukkannya sekali.
        </p>
      </div>
    </div>
  );
}
