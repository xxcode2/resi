import { Plus, Trash2, Store, UserPlus, MapPin, Truck, Package } from "lucide-react";

const EMPTY_ITEM = { name: "", qty: 1, price: "" };

const inputCls =
  "w-full rounded-lg border border-ink-900/10 bg-paper-50/40 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:border-signal focus:bg-white focus:outline-none focus:ring-2 focus:ring-signal/15";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </label>
  );
}

/** Judul seksi kecil dengan ikon, memberi pemisah visual antar kelompok field. */
function Section({ icon: Icon, title, children }) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-3 flex items-center gap-2 border-b border-ink-900/10 pb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-signal/10 text-signal">
          <Icon size={14} />
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/**
 * Form input resi manual. Semua field opsional — preview & tombol cetak aktif
 * begitu ada satu-dua field terisi (logika di useManualReceipt).
 */
export default function OrderForm({ order, onChange }) {
  const set = (patch) => onChange({ ...order, ...patch });

  const setItem = (idx, patch) => {
    const items = order.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    set({ items });
  };
  const addItem = () => set({ items: [...order.items, { ...EMPTY_ITEM }] });
  const removeItem = (idx) => set({ items: order.items.filter((_, i) => i !== idx) });

  const items = order.items.length ? order.items : [{ ...EMPTY_ITEM }];

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-base font-semibold text-ink-900">Data Pesanan</h2>
      <p className="mt-1 text-xs text-ink-500">Isi manual tanpa perlu file. Preview otomatis terbentuk di kanan.</p>

      <div className="mt-2">
        <Section icon={Store} title="Toko">
          <Field label="Nama Toko (header resi)">
            <input className={inputCls} value={order.store || ""} onChange={(e) => set({ store: e.target.value })} placeholder="Toko Maju Jaya" />
          </Field>
        </Section>

        <Section icon={UserPlus} title="Pengirim">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Pengirim">
              <input className={inputCls} value={order.senderName || ""} onChange={(e) => set({ senderName: e.target.value })} placeholder="Andi" />
            </Field>
            <Field label="No. Pengirim">
              <input className={inputCls} inputMode="tel" value={order.senderPhone || ""} onChange={(e) => set({ senderPhone: e.target.value })} placeholder="0812xxxxxxx" />
            </Field>
          </div>
        </Section>

        <Section icon={MapPin} title="Penerima & Tujuan">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Penerima">
              <input className={inputCls} value={order.recipientName || ""} onChange={(e) => set({ recipientName: e.target.value })} placeholder="Budi Santoso" />
            </Field>
            <Field label="No. HP Penerima">
              <input className={inputCls} inputMode="tel" value={order.recipientPhone || ""} onChange={(e) => set({ recipientPhone: e.target.value })} placeholder="0898xxxxxxx" />
            </Field>
          </div>
          <Field label="Tujuan / Alamat Lengkap" className="mt-3">
            <textarea className={`${inputCls} min-h-[68px] resize-y`} value={order.address || ""} onChange={(e) => set({ address: e.target.value })} placeholder="Jl. Merdeka No. 10, Kel. Sukamaju, Kec. Cimanggis, Kota Depok, Jawa Barat 16451" />
          </Field>
        </Section>

        <Section icon={Truck} title="Pengiriman">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kurir">
              <input className={inputCls} value={order.courier || ""} onChange={(e) => set({ courier: e.target.value })} placeholder="JNE" />
            </Field>
            <Field label="Layanan">
              <input className={inputCls} value={order.service || ""} onChange={(e) => set({ service: e.target.value })} placeholder="REG" />
            </Field>
          </div>
          <Field label="No. Resi / Booking" className="mt-3">
            <input className={`${inputCls} font-mono`} value={order.tracking || ""} onChange={(e) => set({ tracking: e.target.value })} placeholder="JX00012345678" />
          </Field>
        </Section>

        <Section icon={Package} title="Produk">
          <div className="space-y-2">
            {items.map((it, idx) => {
              const qty = Number(it.qty) || 0;
              const price = Number(it.price) || 0;
              const amount = qty * price;
              return (
                <div key={idx} className="rounded-lg border border-ink-900/10 bg-paper-50/40 p-2.5">
                  <div className="flex items-center gap-2">
                    <input className={`${inputCls} flex-1`} value={it.name} onChange={(e) => setItem(idx, { name: e.target.value })} placeholder="Nama produk" />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="rounded-md p-2 text-ink-300 transition-colors hover:bg-signal/5 hover:text-signal"
                      aria-label="Hapus produk"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <Field label="Qty">
                      <input className={`${inputCls} py-1`} type="number" min="0" inputMode="numeric" value={it.qty} onChange={(e) => setItem(idx, { qty: e.target.value })} />
                    </Field>
                    <Field label="Harga">
                      <input className={`${inputCls} py-1`} type="number" min="0" inputMode="numeric" value={it.price} onChange={(e) => setItem(idx, { price: e.target.value })} placeholder="0" />
                    </Field>
                    <Field label="Subtotal">
                      <div className="rounded-lg border border-ink-900/5 bg-white px-3 py-2 text-sm font-mono text-ink-700">
                        {amount ? amount.toLocaleString("id-ID") : "0"}
                      </div>
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-900/20 px-3 py-2 text-xs font-medium text-ink-700 transition-colors hover:border-signal hover:text-signal"
          >
            <Plus size={14} /> Tambah Produk
          </button>
        </Section>

        <Section icon={Truck} title="Ringkasan">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ongkir (Rp)">
              <input className={inputCls} type="number" min="0" inputMode="numeric" value={order.shipping || ""} onChange={(e) => set({ shipping: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Catatan">
              <input className={inputCls} value={order.notes || ""} onChange={(e) => set({ notes: e.target.value })} placeholder="opsional" />
            </Field>
          </div>
        </Section>
      </div>
    </div>
  );
}
