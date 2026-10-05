# XYZ Thermal — Cetak Resi Bluetooth

Aplikasi frontend (React + Vite + Tailwind) untuk mencetak resi e-commerce (PDF/PNG/JPG) langsung ke printer thermal Bluetooth lewat Web Bluetooth API — tanpa aplikasi pihak ketiga. Dilengkapi **pengunci akses berbasis kode unik** per pengguna, cocok untuk dijual/dibagikan ke banyak orang dari satu hosting.

## 0. Kode Akses Pembeli (Lisensi)

Aplikasi terkunci sampai user memasukkan kode akses yang valid. Verifikasi sepenuhnya client-side (tanpa database/server): kode di-hash SHA-256 di browser lalu dicocokkan dengan daftar hash di `src/constants/licenses.js`.

**Cara membuat kode untuk pembeli baru:**

```bash
# generate 100 kode acak + hash-nya sekaligus
node scripts/gen-licenses.mjs 100

# atau hash daftar kode buatan sendiri (satu kode per baris)
node scripts/gen-licenses.mjs --from kode.txt
```

Output berupa dua file di folder `licenses/` (sudah di-`gitignore`, tidak ikut ke-deploy):
1. **`kode-<tanggal>.txt`** — daftar kode asli, format `<kode>  <hash>`. Bagikan **kolom kode** (kiri) ke **satu pembeli**; kolom hash cuma arsip, jangan diberikan. Buka file ini di Notepad untuk catatan penjualan.
2. **`hashes-<tanggal>.js`** — array `LICENSE_HASHES` siap pakai. Salin **seluruh isinya** menggantikan array lama di `src/constants/licenses.js` (jangan cuma menambah baris — kalau tidak dihapus, kode yang sudah dicabut tetap aktif), lalu deploy ulang.

Tambahkan `--print` di akhir command kalau mau daftar lengkapnya juga tercetak ke terminal (tidak perlu untuk jumlah besar).

Kode yang sudah benar disimpan di localStorage browser pembeli, jadi cukup memasukkan kode sekali. Untuk **mencabut** akses seseorang: regenerate daftar hash tanpa kode orang tersebut, deploy ulang — tiket tersimpan di perangkatnya otomatis tidak berlaku lagi.

> ⚠️ Catatan keamanan: tanpa backend, verifikasi client-side bisa dilewati oleh pengguna lanjutan (mis. memanggil fungsi hash manual dari konsol). Daftar kode juga tidak ikut ter-bundle — hanya hash-nya, jadi kode milik pembeli lain tidak bisa dibaca dari source. Untuk proteksi lebih ketat, perlu verifikasi server-side.

> ℹ️ Biaya bundel: tiap 1000 kode menambah ± 64 KB source hash (± 38 KB setelah gzip) ke file aplikasi. 1000 kode masih wajar; kalau nanti sampai 5.000+, pertimbangkan memisahkan daftar hash ke file terpisah yang dimuat saat aplikasi jalan (lazy load).

Teks halaman produk (judul, deskripsi, FAQ, kata kunci) untuk Shopee/Tokopedia/TikTok sudah disiapkan di `DESKRIPSI-PRODUK.md` — tinggal ganti harga dan nomor kontak.

## 1. Persyaratan

- Node.js 18+ dan npm
- Browser **Chrome** atau **Edge** versi terbaru (desktop atau Android). Web Bluetooth API **tidak didukung** Safari maupun Firefox.
- Printer thermal Bluetooth (BLE) yang sudah menyala dan dalam mode discoverable.

## 2. Instalasi & Menjalankan di Localhost

```bash
# 1. Masuk ke folder project
cd thermal-print-app

# 2. Install semua dependency
npm install

# 3. Jalankan development server
npm run dev
```

Vite akan menampilkan URL seperti `http://localhost:5173`. Buka URL tersebut di Chrome/Edge.

> Web Bluetooth API mengharuskan "secure context" (HTTPS atau `localhost`). Karena kita akses lewat `localhost`, ini sudah otomatis aman — tidak perlu setup HTTPS manual untuk development.

## 3. Cara Pakai

1. Buka aplikasi → masukkan **kode akses** yang Anda terima → klik **Buka Akses**.
2. Pilih mode di bagian atas: **Unggah File** (resi PDF/PNG/JPG) atau **Input Manual** (ketik data pesanan — lihat bagian 8).
3. Klik **Hubungkan Printer** → pilih printer Bluetooth Anda dari dialog yang muncul.
4. Setelah status berubah jadi **Terhubung**, atur **lebar kertas** (40/58/58+/64/72/80 mm), **threshold**, **dithering**, dan **ruang gunting** sambil melihat preview hasil konversi di kanan.
5. Klik **Print**.

Butuh panduan visual? Klik tombol **Cara Pakai** di header — tersedia modal tutorial berisi langkah-langkah cetak, cara input manual, daftar printer yang didukung, dan bagian "Kalau Bermasalah" (`src/components/TutorialModal.jsx`).

## 4. Struktur Folder

```
src/
├── components/          # Komponen UI (presentational)
│   ├── ui/               # Komponen primitif (Button, StatusBadge)
│   ├── LicenseGate.jsx   # Layar kunci akses (input kode)
│   ├── Header.jsx
│   ├── TutorialModal.jsx # Modal "Cara Pakai" / tutorial cetak
│   ├── PrinterPanel.jsx
│   ├── FileUploader.jsx
│   ├── OrderForm.jsx     # Form input resi manual
│   ├── ReceiptPreview.jsx
│   └── PrintControls.jsx
├── hooks/
│   ├── useBluetoothPrinter.js   # Semua logika Web Bluetooth (connect/disconnect/kirim data)
│   ├── useReceiptConverter.js   # Pipeline file -> canvas -> bitmap monokrom
│   └── useManualReceipt.js      # State & preview untuk mode input manual
├── utils/
│   ├── pdfToCanvas.js     # Render PDF (pdf.js) & load gambar ke canvas
│   ├── multiPageConvert.js # Konversi massal semua halaman PDF + progress
│   ├── manualReceipt.js   # Gambar layout resi kargo ke canvas (mode manual)
│   ├── pageRange.js       # Parser rentang halaman ("1-3,5,8-")
│   ├── imageProcessor.js  # Grayscale, threshold, Floyd-Steinberg dithering
│   ├── escpos.js          # Builder perintah ESC/POS (init, raster image, cut)
│   └── license.js         # Hash & verifikasi kode akses
├── constants/
│   ├── bluetooth.js       # UUID service/characteristic printer yang dikenal + ukuran chunk
│   └── licenses.js        # Daftar hash SHA-256 kode akses yang valid
├── App.jsx
└── main.jsx
scripts/
└── gen-licenses.mjs       # Generator kode akses + hash untuk licenses.js
public/
└── jualan.html            # Deck foto produk (10 slide 1:1) untuk halaman online shop
```

## 5. Jika Printer Tidak Terdeteksi / Gagal Kirim Data

Setiap merek printer thermal murah punya UUID service/characteristic Bluetooth yang berbeda. Aplikasi ini mencoba 13 UUID service + 7 UUID characteristic yang paling umum (`src/constants/bluetooth.js`), lalu **memperbaiki diri saat runtime**:

- Semua characteristic dengan property `write` / `writeWithoutResponse` ikut dipertimbangkan, dan yang paling meyakinkan dipilih lewat sistem skor (service dikenal +3, characteristic dikenal +3, dukungan `writeWithoutResponse` +1). Jadi merek yang belum pernah dicoba pun tetap punya peluang jalan.
- Mode tulis di-fallback otomatis: `writeWithoutResponse` → `writeValue`.
- Ukuran paket dikecilkan bertahap 180 → 90 → 45 → 20 byte kalau printer menolak, sehingga MTU kecil tidak lagi bikin cetak gagal.

Kalau printer Anda tetap tidak terdeteksi:

1. Pastikan printer benar-benar printer **BLE** (Bluetooth Low Energy), bukan Bluetooth Classic/SPP saja — Web Bluetooth API hanya bisa bicara dengan BLE. Printer yang hanya "Bluetooth Classic" harus dipasangkan lewat aplikasi pabrikan atau pakai adapter.
2. Saat printer sedang ter-pair, buka `chrome://bluetooth-internals` di tab baru, cari device Anda, lihat daftar **Service** dan **Characteristic**-nya.
3. Tambahkan UUID service/characteristic yang muncul ke `KNOWN_PRINTER_SERVICES` / `KNOWN_PRINTER_CHARACTERISTICS` di `src/constants/bluetooth.js`, lalu refresh dan coba hubungkan lagi.
4. Kalau data terkirim tapi hasil cetak terpotong/putus-putus, naikkan jeda antar paket (`DEFAULT_CHUNK_DELAY_MS`) atau turunkan `DEFAULT_CHUNK_SIZE` di file yang sama.

## 6. Rencana Pengembangan Lanjutan (SaaS)

Struktur folder sudah disiapkan agar mudah ditambah:

- `src/pages/` — sudah dibuat kosong, siap diisi halaman Login/Register/Dashboard ketika Anda menambahkan routing (mis. `react-router-dom`).
- Logika Bluetooth & konversi gambar sepenuhnya terpisah dari komponen UI (custom hooks + utils murni), sehingga bisa dipakai ulang di halaman baru tanpa duplikasi.
- Untuk billing/langganan, tambahkan context/provider baru (mis. `src/context/AuthContext.jsx`, `src/context/BillingContext.jsx`) dan bungkus di `main.jsx` — tidak perlu mengubah struktur yang sudah ada.

## 7. Catatan Teknis Penting

- **Kenapa harus dikonversi ke bitmap dulu?** Printer thermal murah tidak punya rendering engine PDF/font vektor. Satu-satunya bahasa yang mereka pahami untuk gambar adalah *raster bitmap* 1-bit lewat perintah ESC/POS `GS v 0`. Karena itu PDF/gambar apa pun harus "difoto" jadi bitmap hitam-putih dulu sebelum dikirim.
- **Kenapa dikirim per-chunk?** GATT characteristic write punya batas ukuran payload (tergantung MTU koneksi, umumnya puluhan-ratusan byte). Mengirim seluruh gambar sekaligus akan gagal atau membuat data korup, karena itu `useBluetoothPrinter` memecahnya jadi potongan kecil dengan jeda antar pengiriman.
- **Klik kanan dinonaktifkan.** Di seluruh aplikasi (termasuk layar kode akses) menu konteks browser disembunyikan, termasuk long-press di HP, supaya preview hasil cetak tidak tinggal "Simpan gambar". Kolom isian (nama, alamat, no. HP) tetap bisa klik kanan agar copy-paste jalan. Ini hanya pencegahan tampilan — bukan proteksi keamanan; pembuka tab terlatih tetap bisa lewat devtools.

## 8. Input Resi Manual (tanpa file)

Untuk penjual yang tidak bisa/bosan mengunduh PDF dari marketplace, tersedia tab **Input Manual**. Cukup ketik: nama toko, penerima, no. HP, alamat, kurir, no. resi, daftar produk (nama/qty/harga), ongkir, dan catatan. Layout resi digambar otomatis ke canvas (`src/utils/manualReceipt.js`) lalu dialirkan ke pipeline konversi yang sama dengan mode upload, jadi hasil cetaknya konsisten. Preview dan tombol Print aktif begitu ada satu field terisi.

## 9. Install sebagai Aplikasi (PWA)

Aplikasi ini PWA: bisa **di-install ke home screen** HP/laptop dan **dipakai offline** setelah kunjungan pertama (shell app + font di-cache service worker).

- Chrome/Edge Android: buka situs → menu ⋮ → **Add to Home screen / Install app**.
- Chrome/Edge desktop: klik ikon install di address bar.
- Konfigurasi ada di `vite.config.js` (plugin `VitePWA`) dan ikon di `public/icons/`. Regenerasi ikon: `powershell -File scripts/make-icons.ps1`.

> Catatan: Web Bluetooth tetap butuh izin & interaksi user; offline hanya berlaku untuk memuat aplikasi dan memproses resi, bukan untuk koneksi Bluetooth-nya.

## 10. Lebar Kertas & Ruang Gunting

Enam pilihan lebar kertas tersedia di panel preview (titik = pixel raster pada 203 dpi, 8 dot/mm):

| Label | Dot | Keterangan |
| --- | --- | --- |
| 40 mm | 320 | printer label/struk kecil |
| 58 mm | 384 | paling umum, thermal 1 roll |
| 58+ mm | 420 | 58 mm yang kertasnya sedikit lebih lebar |
| 64 mm | 512 | unit ukuran tengah |
| 72 mm | 576 | 80 mm dengan margin aman (paling jarang terpotong) |
| 80 mm | 640 | 80 mm penuh |

**Ruang Gunting** (Ketat / Sedang / Longgar) menambahkan baris kosong putih di bawah tiap resi — 0 / 60 / 120 dot — supaya ada tempat untuk menggunting per pesanan. Ini dilakukan dengan memperpanjang raster (bukan perintah `ESC d`), karena sebagian printer murah mengabaikan perintah feed. Berlaku juga untuk setiap halaman pada mode cetak massal.

## 11. Foto Produk untuk Online Shop

`public/jualan.html` adalah halaman terpisah (tidak ter-link dari UI aplikasi) berisi 10 slide rasio 1:1 siap screenshot untuk foto produk Shopee/Tokopedia/TikTok: hero, masalah, fitur, cara pakai, mock tampilan aplikasi, hasil cetak, kompatibilitas printer, perbandingan, FAQ, dan penutup. Desainnya mengikuti palet & font aplikasi asli.

```bash
# development
npm run dev    # lalu buka http://localhost:5173/jualan.html

# production
npm run build  # jualan.html ikut tersalin ke dist/ (folder public/ = root situs)
```

Buka halaman di Chrome/Edge dengan lebar jendela minimal ~900px untuk hasil paling tajam (slide = 888px), lalu screenshot tiap kotak. File ini juga ikut ter-deploy, jadi bisa dibuka dari URL hosting — simpan sebagai bookmark, jangan bagikan tautannya ke pembeli (tidak ada proteksi, hanya tidak ter-link).

Isi slide (harga, klaim merek, tautan) diedit langsung di file itu — semuanya HTML + CSS biasa. Ukuran isi slide memakai *container query unit* (`cqw`), jadi komposisinya tetap sama persis apakah dibuka di laptop atau di HP. Klik **Sembunyikan Panduan** sebelum screenshot agar bar petunjuknya hilang.
