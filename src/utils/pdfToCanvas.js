import * as pdfjsLib from "pdfjs-dist";
// Trik Vite: import worker sebagai URL supaya ikut ter-bundle dengan benar
// tanpa perlu menaruh file worker manual di folder public/.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Membuat salinan ArrayBuffer karena pdf.js men-detach buffer yang
 * diberikan ke getDocument(). Tanpa copy, buffer tidak bisa dipakai
 * berulang kali.
 */
function cloneArrayBuffer(source) {
  return source.slice(0);
}

/**
 * Merender satu halaman dari dokumen pdf.js menjadi HTMLCanvasElement.
 * `targetWidthPx` = resolusi render; buat 2-3x lebar printer supaya hasil
 * resize ke bawah tetap tajam, bukan pecah/blur.
 */
async function renderPage(pdf, pageNumber, targetWidthPx) {
  const page = await pdf.getPage(pageNumber);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidthPx / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const ctx = canvas.getContext("2d");
  // PDF resi biasanya punya background transparan; paksa putih dulu agar
  // area kosong tidak ikut jadi hitam saat threshold nanti.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup(); // bebaskan memori internal halaman sebelum pindah ke halaman lain

  return canvas;
}

/**
 * Merender satu halaman PDF menjadi canvas + menghitung jumlah halaman,
 * semuanya dari satu kali buka dokumen.
 *
 * @param {ArrayBuffer} arrayBuffer isi file PDF
 * @returns {Promise<{ pageCount: number, renderPage(pageNumber, targetWidthPx): Promise<HTMLCanvasElement>, destroy(): Promise<void> }>}
 */
export async function openPdf(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: cloneArrayBuffer(arrayBuffer) }).promise;
  return {
    pageCount: pdf.numPages,
    renderPage: (pageNumber, targetWidthPx = 1200) => renderPage(pdf, pageNumber, targetWidthPx),
    destroy: () => pdf.destroy(),
  };
}

/** Memuat file gambar (PNG/JPG) menjadi HTMLImageElement siap dipakai canvas. */
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File gambar tidak bisa dibaca. Pastikan format PNG/JPG valid."));
    };
    img.src = url;
  });
}
