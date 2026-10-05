import { openPdf } from "./pdfToCanvas";
import { canvasToMonochromeBitmap, cropWhitespace, resizeToWidth } from "./imageProcessor";

/**
 * Mengonversi halaman PDF menjadi array bitmap monokrom.
 * Bisa semua halaman atau hanya halaman tertentu.
 *
 * @param {File} file - File PDF
 * @param {Object} settings
 * @param {number} settings.paperWidthDots - lebar kertas dalam dot
 * @param {number} settings.threshold - 0-255
 * @param {boolean} settings.dither - pakai dithering atau tidak
 * @param {number[]} [pages] - daftar nomor halaman yang mau dikonversi (opsional, default = semua)
 * @param {function} [onProgress] - callback(currentPage, totalPages)
 * @returns {Promise<{ bitmaps: Array, pageCount: number }>}
 */
export async function convertAllPdfPages(file, { paperWidthDots, threshold, dither }, onProgress, pages) {
  const arrayBuffer = await file.arrayBuffer();
  // Dokumen dibuka satu kali untuk semua halaman; kalau dibuka per halaman,
  // PDF 50 halaman harus di-parse ulang 50 kali (lambat & boros memori).
  const doc = await openPdf(arrayBuffer);
  const pageCount = doc.pageCount;
  const pagesToConvert = pages || Array.from({ length: pageCount }, (_, i) => i + 1);
  const bitmaps = [];

  try {
    for (let i = 0; i < pagesToConvert.length; i++) {
      const page = pagesToConvert[i];
      const canvas = await doc.renderPage(page, paperWidthDots * 3);

      const resized = resizeToWidth(canvas, paperWidthDots);
      const rawBitmap = canvasToMonochromeBitmap(resized, { threshold, dither });
      const bitmap = cropWhitespace(rawBitmap);

      bitmaps.push(bitmap);

      if (onProgress) onProgress(i + 1, pagesToConvert.length);
    }
  } finally {
    doc.destroy();
  }

  return { bitmaps, pageCount };
}
