import { useEffect } from "react";
import { X, Bluetooth, FileUp, Printer, PenLine, Scissors, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Panduan singkat cara kerja & cara cetak, ditampilkan sebagai modal
 * fullscreen-overlay dari tombol "Cara Pakai" di header.
 */
export default function TutorialModal({ open, onClose }) {
  // Tutup dengan tombol Esc, biar keyboard-user gampang keluar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/50 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="relative max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-paper-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-900/10 bg-paper-50/95 px-6 py-4 backdrop-blur">
          <h2 id="tutorial-title" className="font-display text-lg font-semibold text-ink-900">Cara Pakai & Tutorial Cetak</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-7 px-6 py-6">
          <section>
            <SectionTitle icon={CheckCircle2}>3 Langkah Inti</SectionTitle>
            <ol className="mt-3 space-y-3">
              <Step n={1} title="Hubungkan Printer" icon={Bluetooth}>
                Nyalakan printer thermal, klik <b>Hubungkan Printer</b>, lalu pilih nama printer
                Anda pada dialog Chrome/Edge. Setelah sekali terhubung, aplikasi otomatis
                menyambungkan ulang di sesi berikutnya.
              </Step>
              <Step n={2} title="Siapkan Resi" icon={FileUp}>
                Unggah file PDF/gambar resi dari marketplace, atau pakai tab
                <b> Input Manual</b> kalau tidak ada file yang bisa diunduh.
              </Step>
              <Step n={3} title="Cetak" icon={Printer}>
                Atur lebar kertas sesuai printer Anda, cek preview, tentukan jumlah rangkap,
                lalu klik <b>Print</b>. Untuk PDF multi-halaman ada tombol <b>Cetak Semua Halaman</b>.
              </Step>
            </ol>
          </section>

          <section>
            <SectionTitle icon={FileUp}>Cara Cetak Resi dari File (Shopee / Tokopedia / dll)</SectionTitle>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-700">
              <li>Di aplikasi marketplace, buka pesanan → <i>Unduh Resi / Label Pengiriman</i> (biasanya format PDF).</li>
              <li>Klik area unggah di kolom kiri, pilih file PDF atau gambar tadi.</li>
              <li>Preview hitam-putih muncul di kanan — itu persis hasil cetaknya.</li>
              <li>Pilih <b>Lebar Kertas</b> yang sama dengan printer Anda (lihat bagian "Printer apa yang didukung").</li>
              <li>Atur jumlah rangkap & ruang gunting, klik <b>Print</b>. Kertas keluar, robek/gunting di area kosong bawah.</li>
            </ol>
            <p className="mt-3 rounded-lg bg-paper-100 px-3 py-2 text-xs text-ink-500">
              💡 Satu PDF berisi banyak resi/halaman? Klik <b>Cetak Semua Halaman</b> — tiap halaman
              dikirim berurutan lengkap dengan jeda sebelum terakhir di-robek.
            </p>
          </section>

          <section>
            <SectionTitle icon={PenLine}>Cara Input Manual (Tanpa File Apapun)</SectionTitle>
            <p className="mt-2 text-sm text-ink-700">
              Untuk marketplace yang tidak menyediakan unduhan resi: klik tab <b>Input Manual</b>, isi
              nama toko, pengirim, penerima + alamat + No. HP, kurir & no. resi, daftar produk, lalu
              biaya kirim. Preview ter-render otomatis persis layout label kargo — tinggal cetak.
            </p>
          </section>

          <section>
            <SectionTitle icon={Printer}>Printer Apa yang Didukung?</SectionTitle>
            <p className="mt-2 text-sm text-ink-700">
              Semua printer thermal <b>Bluetooth LE</b> berbasis ESC/POS — Xprinter, Goojprt, Zjiang,
              HPRT, Rongta, Phomemo, Peripage, MTP-II, Sinmark, Eboss, dll. Pilih berdasarkan ukuran
              kertas:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              <li>• Kertas <b>58mm</b> → pilih lebar <b>58mm (384px)</b></li>
              <li>• Kertas <b>80mm</b> → coba <b>72mm (576px)</b> dulu (paling aman); kalau hasil cetak
                terlihat menyempit/kecil, ganti ke <b>80mm (640px)</b></li>
            </ul>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-500">
              <Scissors size={13} className="mt-0.5 shrink-0" />
              Opsi <b>Ruang Gunting</b> menambah area kosong di bawah resi supaya mudah digunting/robek per resi.
            </p>
          </section>

          <section>
            <SectionTitle icon={AlertTriangle}>Kalau Bermasalah</SectionTitle>
            <div className="mt-3 space-y-2 text-sm">
              <Trouble q="Printer tidak muncul di dialog pilihan">
                Pastikan printer <b>menyala dan mode Bluetooth-nya aktif</b> (biasanya LED berkedip cepat).
                Browser hanya melihat printer BLE yang sedang <i>advertising</i>. Tutup tab lain yang
                mungkin memakai printer yang sama, lalu coba lagi.
              </Trouble>
              <Trouble q="Muncul 'Browser tidak mendukung Web Bluetooth'">
                Pakai <b>Chrome atau Edge</b> (di Android/iOS/PC). Safari dan Firefox tidak mendukung
                Web Bluetooth — di iPhone gunakan aplikasi <i>Bluefy</i> (browser dengan Web Bluetooth).
                Dan wajib akses lewat <b>https</b> (termasuk situs ini, yang sudah otomatis https).
              </Trouble>
              <Trouble q="Hasil cetak terpotong kiri/kanan">
                Lebar kertas pilihan tidak sama dengan printer. Coba turunkan: 80mm→72mm, atau 72mm→58mm.
              </Trouble>
              <Trouble q="Tulisan hasil cetak pudar / berbayang">
                Naikkan <b>Kontras</b> di panel kanan, dan matikan <b>Perhalus (dither)</b> bila sedang aktif.
              </Trouble>
              <Trouble q="Koneksi terputus saat mencetak / data macet di tengah">
                Dekatkan HP/PC ke printer (BLE efektif ≤ 2–3 meter), pastikan baterai printer penuh, lalu
                coba lagi — aplikasi akan otomatis menyambungkan ulang.
              </Trouble>
              <Trouble q="Kode akses ditolak">
                Ketik ulang tanpa spasi (huruf besar/kecil tidak masalah). Kalau masih ditolak, kode Anda
                mungkin sudah dinonaktifkan — hubungi penjual.
              </Trouble>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-signal/10 text-signal">
        <Icon size={14} />
      </span>
      {children}
    </h3>
  );
}

function Step({ n, title, icon: Icon, children }) {
  return (
    <li className="flex gap-3 rounded-xl border border-ink-900/10 bg-white p-3 shadow-card">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal text-sm font-bold text-white">
        {n}
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Icon size={14} className="text-signal" /> {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-700">{children}</p>
      </div>
    </li>
  );
}

function Trouble({ q, children }) {
  return (
    <div className="rounded-lg bg-paper-100 px-3 py-2">
      <p className="font-medium text-ink-900">{q}</p>
      <p className="mt-1 leading-relaxed text-ink-700">{children}</p>
    </div>
  );
}
