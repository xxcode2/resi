/**
 * Membangun gambar resi (HTMLCanvasElement) dari data order yang diketik
 * manual — tanpa perlu file PDF/gambar sama sekali. Hasil canvas lalu
 * dialirkan ke pipeline yang sama dengan mode upload (grayscale -> threshold
 * -> cropWhitespace -> bitmap 1-bit -> ESC/POS), jadi kualitas cetaknya konsisten.
 *
 * Kanvas digambar langsung pada lebar `paperWidthDots` (lebar cetak printer),
 * jadi teks tetap tajam tanpa perlu resize.
 */

const FONT_STACK = "Inter, system-ui, sans-serif";
const MONO_STACK = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

const idr = new Intl.NumberFormat("id-ID");

/** "15000" -> "Rp15.000". Kosong/NaN/0 -> string kosong. */
function formatRupiah(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "";
  return `Rp${idr.format(n)}`;
}

/**
 * @param {Object} order
 * @param {string} [order.store]          nama toko (header, opsional)
 * @param {string} [order.senderName]     pengirim
 * @param {string} [order.senderPhone]    no. pengirim
 * @param {string} [order.recipientName]  penerima
 * @param {string} [order.recipientPhone] no. HP penerima
 * @param {string} [order.address]        tujuan / alamat lengkap
 * @param {string} [order.courier]        kurir
 * @param {string} [order.service]        layanan
 * @param {string} [order.tracking]       nomor resi
 * @param {Array}  [order.items]          [{ name, qty, price }]
 * @param {string} [order.shipping]       ongkir (angka)
 * @param {string} [order.notes]          catatan
 * @param {{ paperWidthDots: number }} opts
 * @returns {HTMLCanvasElement|null} null kalau order kosong
 */
export function buildManualReceiptCanvas(order, { paperWidthDots }) {
  const o = order || {};
  const items = (o.items || []).filter((it) => it && String(it.name || "").trim());

  const hasContent =
    o.store || o.senderName || o.senderPhone || o.recipientName || o.recipientPhone ||
    o.address || o.courier || o.service || o.tracking || items.length || o.notes;
  if (!hasContent) return null;

  const width = paperWidthDots;
  const margin = Math.round(width * 0.055);
  const cw = width - margin * 2;

  const scale = width / 576;
  const px = (n) => Math.max(11, Math.round(n * scale));
  const S = {
    store: px(32),
    name: px(28),
    body: px(21),
    big: px(25),
    small: px(18),
    label: px(14),
  };
  const lh = (p) => Math.round(p * 1.34);

  const meas = document.createElement("canvas").getContext("2d");
  const setFont = (p, weight, family) => {
    meas.font = `${weight} ${p}px ${family}`;
  };
  const measure = (t, p, weight, family) => {
    setFont(p, weight, family);
    return meas.measureText(t).width;
  };

  /** Word-wrap teks (mendukung \n manual) ke array baris yang muat maxW. */
  function wrap(text, p, weight, family, maxW) {
    const out = [];
    for (const para of String(text ?? "").split("\n")) {
      const words = para.split(/\s+/).filter(Boolean);
      if (!words.length) {
        out.push("");
        continue;
      }
      setFont(p, weight, family);
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (meas.measureText(test).width > maxW && line) {
          out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  }

  // ---- kumpulkan perintah gambar, hitung Y saat build ----
  const ops = [];
  let y = 0;
  const gap = (g) => {
    y += g;
  };

  function putText(t, { p, weight = "500", color = "#000", family = FONT_STACK, x = margin }) {
    ops.push({ k: "text", t, x, y, p, weight, color, family });
    y += lh(p);
  }
  function centerText(t, { p, weight = "500", color = "#000", family = FONT_STACK }) {
    const x = Math.round((width - measure(t, p, weight, family)) / 2);
    ops.push({ k: "text", t, x, y, p, weight, color, family });
    y += lh(p);
  }
  /** Label rata-kiri + titik dua sejajar, nilai wrap rata ke kolom yang sama. */
  function alignRows(rows, { p = S.body, labelWeight = "700", valueWeight = "500", valueFamily = FONT_STACK } = {}) {
    const labels = rows.map(([l]) => String(l).toUpperCase());
    let maxLw = 0;
    for (const l of labels) maxLw = Math.max(maxLw, measure(l, p, labelWeight, FONT_STACK));
    const colonGap = px(10);
    const valueX = margin + maxLw + colonGap;
    const avail = margin + cw - valueX;
    for (let i = 0; i < rows.length; i++) {
      const value = rows[i][1];
      if (labels[i]) {
        ops.push({ k: "text", t: labels[i], x: margin, y, p, weight: labelWeight, color: "#000", family: FONT_STACK });
        ops.push({ k: "text", t: ":", x: margin + maxLw, y, p, weight: labelWeight, color: "#000", family: FONT_STACK });
      }
      const lines = wrap(value, p, valueWeight, valueFamily, avail);
      if (!lines.length) lines.push("");
      ops.push({ k: "text", t: lines[0], x: valueX, y, p, weight: valueWeight, color: "#000", family: valueFamily });
      y += lh(p);
      for (let j = 1; j < lines.length; j++) {
        ops.push({ k: "text", t: lines[j], x: valueX, y, p, weight: valueWeight, color: "#000", family: valueFamily });
        y += lh(p);
      }
    }
  }
  /** Judul seksi kecil dengan penanda, mis. "▸ TUJUAN". */
  function sectionTitle(t) {
    ops.push({ k: "text", t: `\u25b8 ${t.toUpperCase()}`, x: margin, y, p: S.label, weight: "800", color: "#000", family: FONT_STACK });
    y += lh(S.label) + px(2);
  }
  function dashed() {
    ops.push({ k: "dashed", y: y + Math.round(px(4)), x: margin, w: cw });
    y += Math.round(px(14));
  }
  function solid(thick = 2) {
    ops.push({ k: "solid", y: y + Math.round(px(3)), x: margin, w: cw, thick });
    y += Math.round(px(11));
  }

  // ===== HEADER =====
  if (o.store) {
    for (const ln of wrap(o.store, S.store, "800", FONT_STACK, cw)) centerText(ln, { p: S.store, weight: "800" });
    gap(px(1));
    centerText("RESI PENGIRIMAN", { p: S.label, weight: "600" });
    gap(px(4));
    dashed();
  }

  // ===== PENGIRIM =====
  const senderRows = [["Nama", o.senderName], ["No. HP", o.senderPhone]].filter(([, v]) => v);
  if (senderRows.length) {
    sectionTitle("Pengirim");
    alignRows(senderRows, { p: S.body, valueWeight: "600", valueFamily: FONT_STACK });
    gap(px(6));
    dashed();
  }

  // ===== TUJUAN / PENERIMA (blok utama, paling menonjol) =====
  // Nama dicetak besar di atas, jadi baris detail cukup alamat & No. HP.
  const destRows = [["Alamat", o.address], ["No. HP", o.recipientPhone]].filter(([, v]) => v);
  if (o.recipientName || destRows.length) {
    sectionTitle("Tujuan");
    if (o.recipientName) {
      for (const ln of wrap(o.recipientName, S.name, "800", FONT_STACK, cw)) putText(ln, { p: S.name, weight: "800" });
      gap(px(1));
    }
    if (destRows.length) alignRows(destRows, { p: S.body, valueWeight: "600", valueFamily: FONT_STACK });
    gap(px(6));
    dashed();
  }

  // ===== KURIR & NO RESI =====
  const courierLine = [o.courier, o.service].filter(Boolean).join("  \u00b7  ");
  const shipRows = [["Kurir", courierLine], ["No. Resi", o.tracking]].filter(([, v]) => v);
  if (shipRows.length) {
    alignRows(shipRows, { p: S.body, valueWeight: "700", valueFamily: MONO_STACK });
    gap(px(6));
  }
  solid(2);

  // ===== ISI =====
  if (items.length) {
    // precompute lebar kolom agar header & baris sejajar
    const colGap = px(14);
    let maxAmt = measure("SUBTOTAL", S.label, "800", FONT_STACK);
    let maxQty = measure("QTY", S.label, "800", FONT_STACK);
    const rowsData = items.map((it) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.price) || 0;
      const amount = qty * price;
      const amtStr = formatRupiah(amount) || "-";
      const qtyStr = qty > 0 ? String(qty) : "-";
      maxAmt = Math.max(maxAmt, measure(amtStr, S.body, "700", MONO_STACK));
      maxQty = Math.max(maxQty, measure(qtyStr, S.body, "600", MONO_STACK));
      return { name: String(it.name), qtyStr, amtStr, amount };
    });
    const amtX = margin + cw - maxAmt;
    const qtyX = amtX - colGap - maxQty;
    const nameW = qtyX - colGap - margin;

    // header tabel
    ops.push({ k: "text", t: "PRODUK", x: margin, y, p: S.label, weight: "800", color: "#000", family: FONT_STACK });
    ops.push({ k: "text", t: "QTY", x: qtyX + maxQty - measure("QTY", S.label, "800", FONT_STACK), y, p: S.label, weight: "800", color: "#000", family: FONT_STACK });
    ops.push({ k: "text", t: "SUBTOTAL", x: amtX, y, p: S.label, weight: "800", color: "#000", family: FONT_STACK });
    y += lh(S.label);
    gap(px(2));
    dashed();

    let subtotal = 0;
    for (const r of rowsData) {
      subtotal += r.amount;
      const lines = wrap(r.name, S.body, "600", FONT_STACK, nameW);
      if (!lines.length) lines.push("");
      for (let i = 0; i < lines.length; i++) {
        ops.push({ k: "text", t: lines[i], x: margin, y, p: S.body, weight: "600", color: "#000", family: FONT_STACK });
        if (i === 0) {
          ops.push({ k: "text", t: r.qtyStr, x: qtyX + maxQty - measure(r.qtyStr, S.body, "600", MONO_STACK), y, p: S.body, weight: "600", color: "#000", family: MONO_STACK });
          ops.push({ k: "text", t: r.amtStr, x: amtX, y, p: S.body, weight: "700", color: "#000", family: MONO_STACK });
        }
        y += lh(S.body);
      }
    }
    gap(px(4));
    dashed();

    if (o.shipping) {
      const shipStr = formatRupiah(o.shipping) || "-";
      ops.push({ k: "text", t: "ONGKIR", x: margin, y, p: S.body, weight: "500", color: "#000", family: FONT_STACK });
      ops.push({ k: "text", t: shipStr, x: amtX, y, p: S.body, weight: "600", color: "#000", family: MONO_STACK });
      y += lh(S.body);
    }
    const totalStr = formatRupiah(subtotal + (Number(o.shipping) || 0)) || "Rp0";
    ops.push({ k: "text", t: "TOTAL", x: margin, y, p: S.big, weight: "800", color: "#000", family: FONT_STACK });
    ops.push({ k: "text", t: totalStr, x: amtX, y, p: S.big, weight: "800", color: "#000", family: MONO_STACK });
    y += lh(S.big);
  }

  // ===== CATATAN =====
  if (o.notes) {
    gap(px(6));
    dashed();
    alignRows([["Catatan", o.notes]], { p: S.body, valueWeight: "500" });
  }

  // ===== FOOTER =====
  gap(px(8));
  solid(2);
  const stamp = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  centerText(stamp, { p: S.label, weight: "500" });

  // ---- render ops ke canvas final ----
  const height = y + margin;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "top";

  for (const op of ops) {
    if (op.k === "text") {
      ctx.fillStyle = op.color;
      ctx.font = `${op.weight} ${op.p}px ${op.family}`;
      ctx.fillText(op.t, op.x, op.y);
    } else if (op.k === "solid") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(op.x, op.y, op.w, op.thick);
    } else if (op.k === "dashed") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.setLineDash([px(6), px(6)]);
      ctx.beginPath();
      ctx.moveTo(op.x, op.y);
      ctx.lineTo(op.x + op.w, op.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  return canvas;
}
