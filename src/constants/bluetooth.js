/**
 * Kumpulan UUID service & characteristic Bluetooth LE yang dipakai printer
 * thermal ESC/POS di lapangan (Xprinter, Goojprt, Zjiang, HPRT, Rongta,
 * Phomemo, Peripage, MTP-II, HM/HTM, Sinmark, Eboss, Zicox, TSC, CatPrinter,
 * dan merek generik tanpa nama).
 *
 * Web Bluetooth API mengharuskan kita mendaftarkan service yang ingin diakses
 * lewat `optionalServices` SEBELUM request device — service yang tidak
 * didaftarkan tidak bisa di-enumerate setelah connect. Karena tiap merek
 * pakai UUID berbeda, daftarnya dibuat selengkap mungkin; mendaftarkan UUID
 * yang tidak ada di printer sama sekali tidak berbahaya (hanya diabaikan).
 *
 * Setelah connect, karakteristik dipilih otomatis lewat skoring (lihat
 * useBluetoothPrinter.js): service + UUID yang cocok daftar di bawah dapat
 * nilai lebih tinggi, jadi printer dengan merek "aneh" tetap ketemu jalur
 * write-nya.
 *
 * Printer Anda tetap tidak terdeteksi? Buka chrome://bluetooth-internals saat
 * printer menyala, catat UUID service & characteristic yang punya properti
 * write, lalu tambahkan ke daftar ini.
 */
export const KNOWN_PRINTER_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb", // SPP-like — Xprinter/Zjiang generik
  "0000ff00-0000-1000-8000-00805f9b34fb", // Goojprt, MTP-II, Eboss, dll
  "0000ffe0-0000-1000-8000-00805f9b34fb", // HM series (HM-A300, HM-P200)
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC / Microchip transparent UART (Phomemo, Peripage, CatPrinter)
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART Service — printer BLE modern
  "0000ae00-0000-1000-8000-00805f9b34fb", // beberapa HPRT / TSC / Sinmark
  "0000ae30-0000-1000-8000-00805f9b34fb", // varian HPRT lain
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // beberapa printer portable BLE
  "0000fee7-0000-1000-8000-00805f9b34fb", // modul MIJIA/Mijia-based
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000ff02-0000-1000-8000-00805f9b34fb", // sebagian printer listing ff02 sbg service
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000fff1-0000-1000-8000-00805f9b34fb",
];

// UUID characteristic write yang paling sering jadi "jalur data" printer.
export const KNOWN_PRINTER_CHARACTERISTICS = [
  "0000ff02-0000-1000-8000-00805f9b34fb",
  "0000ae01-0000-1000-8000-00805f9b34fb",
  "0000be01-0000-1000-8000-00805f9b34fb",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000fff1-0000-1000-8000-00805f9b34fb",
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART RX (write)
  "49535343-8841-43f4-a8d4-ecbe34729bb3", // ISSC data characteristic
];

// Service standar yang boleh selalu diminta agar bisa membaca nama/metadata.
export const GENERIC_OPTIONAL_SERVICES = ["generic_access", "device_information"];

// Ukuran satu "potongan" data yang dikirim per writeValue().
// Sebagian besar modul BLE hanya nyaman menerima ~20 byte per paket,
// tapi banyak printer modern menerima jauh lebih besar. Ukuran awal disetel
// besar demi kecepatan; kalau printer menolak (ATT MTU kecil), pengirim
// otomatis mengecilkan paket 180 → 90 → 45 → 20 tanpa perlu setting manual.
export const DEFAULT_CHUNK_SIZE = 180;

// Batas bawah ukuran paket — banyak modul BLE tidak bisa di bawah ini.
export const MIN_CHUNK_SIZE = 20;

// Jeda (ms) antar pengiriman chunk agar buffer printer tidak overflow.
export const DEFAULT_CHUNK_DELAY_MS = 12;
