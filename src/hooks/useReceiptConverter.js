import { useEffect, useState } from "react";
import { loadImageFile, openPdf } from "../utils/pdfToCanvas";
import { canvasToMonochromeBitmap, cropWhitespace, renderMonochromeToCanvas, resizeToWidth } from "../utils/imageProcessor";

// Batas jumlah thumbnail yang di-render. PDF gabungan bisa berisi ratusan
// resi; tanpa batas ini browser bisa terkunci lama saat membuat strip
// halaman. Cetak massal TETAP memakai seluruh halaman (tidak dibatasi).
const MAX_THUMBNAILS = 100;

/**
 * Mengubah file resi (PDF/PNG/JPG) menjadi bitmap monokrom siap-cetak,
 * dan menyiapkan data URL untuk preview di layar.
 *
 * Pipeline: file -> canvas (render PDF atau load image) -> resize ke lebar
 * printer -> grayscale + threshold/dither -> bitmap 1-bit.
 *
 * Diproses ulang otomatis setiap kali file atau salah satu setting berubah.
 */
export function useReceiptConverter(file, { paperWidthDots, threshold, dither, pageNumber = 1 }) {
  const [state, setState] = useState({
    status: "idle", // idle | loading | ready | error
    error: null,
    previewUrl: null,
    bitmap: null,
    pageCount: 1,
    thumbnails: [], // data URL kecil untuk setiap halaman PDF
  });

  // Generate thumbnail kecil untuk semua halaman PDF di background
  useEffect(() => {
    if (!file || file.type !== "application/pdf") {
      setState((prev) => ({ ...prev, thumbnails: [] }));
      return;
    }

    let cancelled = false;
    const THUMB_WIDTH = 120;

    (async () => {
      let doc = null;
      try {
        doc = await openPdf(await file.arrayBuffer());
        const thumbs = [];
        const limit = Math.min(doc.pageCount, MAX_THUMBNAILS);

        for (let p = 1; p <= limit; p++) {
          const canvas = await doc.renderPage(p, THUMB_WIDTH * 3);
          const resized = resizeToWidth(canvas, THUMB_WIDTH);
          const rawBmp = canvasToMonochromeBitmap(resized, { threshold, dither });
          const bmp = cropWhitespace(rawBmp);
          const thumbCanvas = renderMonochromeToCanvas(bmp);
          thumbs.push(thumbCanvas.toDataURL("image/png"));
          if (cancelled) return;
        }

        if (cancelled) return;
        setState((prev) => ({ ...prev, thumbnails: thumbs }));
      } catch (err) {
        console.error("Thumbnail generation error:", err);
      } finally {
        if (doc) doc.destroy();
      }
    })();

    return () => { cancelled = true; };
  }, [file, threshold, dither]);

  useEffect(() => {
    if (!file) {
      setState({ status: "idle", error: null, previewUrl: null, bitmap: null, pageCount: 1, thumbnails: [] });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    (async () => {
      let doc = null;
      try {
        let sourceCanvas;
        let pageCount = 1;

        if (file.type === "application/pdf") {
          doc = await openPdf(await file.arrayBuffer());
          pageCount = doc.pageCount;
          // clamp: file lama mungkin punya lebih halaman daripada file baru
          const safePage = Math.min(Math.max(1, pageNumber), pageCount);
          sourceCanvas = await doc.renderPage(safePage, paperWidthDots * 3); // render besar lalu resize turun = tajam
        } else {
          sourceCanvas = await loadImageFile(file);
        }

        const resized = resizeToWidth(sourceCanvas, paperWidthDots);
        const rawBitmap = canvasToMonochromeBitmap(resized, { threshold, dither });
        const bitmap = cropWhitespace(rawBitmap);

        const previewCanvas = renderMonochromeToCanvas(bitmap);

        if (cancelled) return;
        setState((prev) => ({
          status: "ready",
          error: null,
          previewUrl: previewCanvas.toDataURL("image/png"),
          bitmap,
          pageCount,
          thumbnails: prev.thumbnails,
        }));
      } catch (err) {
        console.error("Receipt conversion error:", err);
        if (cancelled) return;
        setState((prev) => ({
          status: "error",
          error: err?.message || "Gagal memproses file resi.",
          previewUrl: null,
          bitmap: null,
          pageCount: 1,
          thumbnails: prev.thumbnails,
        }));
      } finally {
        if (doc) doc.destroy();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, paperWidthDots, threshold, dither, pageNumber]);

  return state;
}
