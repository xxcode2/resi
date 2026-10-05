import { useEffect, useState } from "react";
import { canvasToMonochromeBitmap, cropWhitespace, renderMonochromeToCanvas } from "../utils/imageProcessor";
import { buildManualReceiptCanvas } from "../utils/manualReceipt";

/**
 * Padanan useReceiptConverter untuk mode input manual: mengubah data order
 * menjadi bitmap monokrom siap-cetak + data URL preview, memakai pipeline
 * pemrosesan gambar yang sama persis dengan mode upload.
 */
export function useManualReceipt(order, { paperWidthDots, threshold, dither }) {
  const [state, setState] = useState({
    status: "idle", // idle | ready | error
    error: null,
    previewUrl: null,
    bitmap: null,
  });

  useEffect(() => {
    try {
      const canvas = buildManualReceiptCanvas(order, { paperWidthDots });
      if (!canvas) {
        setState({ status: "idle", error: null, previewUrl: null, bitmap: null });
        return;
      }
      const raw = canvasToMonochromeBitmap(canvas, { threshold, dither });
      const bitmap = cropWhitespace(raw, 10);
      const previewUrl = renderMonochromeToCanvas(bitmap).toDataURL("image/png");
      setState({ status: "ready", error: null, previewUrl, bitmap });
    } catch (err) {
      console.error("Manual receipt error:", err);
      setState({ status: "error", error: err?.message || "Gagal membuat resi.", previewUrl: null, bitmap: null });
    }
    // order adalah state objek di parent; identity-nya stabil kecuali diedit.
  }, [order, paperWidthDots, threshold, dither]);

  return state;
}
