import { useEffect, useState } from "react";
import clsx from "clsx";
import { Upload, PenLine } from "lucide-react";
import Header from "./components/Header";
import PrinterPanel from "./components/PrinterPanel";
import FileUploader from "./components/FileUploader";
import OrderForm from "./components/OrderForm";
import ReceiptPreview from "./components/ReceiptPreview";
import PrintControls from "./components/PrintControls";
import LicenseGate from "./components/LicenseGate";
import TutorialModal from "./components/TutorialModal";
import { useBluetoothPrinter, PRINTER_STATUS } from "./hooks/useBluetoothPrinter";
import { useReceiptConverter } from "./hooks/useReceiptConverter";
import { useManualReceipt } from "./hooks/useManualReceipt";
import { hasStoredUnlock } from "./utils/license";

const DEFAULT_SETTINGS = {
  paperWidthDots: 576, // 72mm area cetak (576 dot @ 203dpi), aman untuk kertas 58-80mm
  threshold: 180,
  dither: false,
  pageNumber: 1,
  pageRange: "", // kosong = semua halaman
};

const EMPTY_ORDER = {
  store: "",
  senderName: "",
  senderPhone: "",
  recipientName: "",
  recipientPhone: "",
  address: "",
  courier: "",
  service: "",
  tracking: "",
  items: [{ name: "", qty: 1, price: "" }],
  shipping: "",
  notes: "",
};

export default function App() {
  // Aplikasi terkunci sampai pembeli memasukkan kode akses yang valid.
  const [unlocked, setUnlocked] = useState(() => hasStoredUnlock());

  // Klik kanan (dan long-press di HP) dimatikan di seluruh aplikasi supaya
  // menu "Simpan gambar / Inspeksi" tidak gampang dipakai buat menyalin.
  // Sifatnya pencegahan saja — bukan pengaman data.
  useEffect(() => {
    const block = (e) => {
      // Kolom isian tetap boleh klik kanan — pembeli butuh copy-paste alamat/no. HP.
      const el = e.target;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      e.preventDefault();
    };
    window.addEventListener("contextmenu", block);
    return () => window.removeEventListener("contextmenu", block);
  }, []);

  const printer = useBluetoothPrinter();
  const [mode, setMode] = useState("upload"); // "upload" | "manual"
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState(EMPTY_ORDER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showTutorial, setShowTutorial] = useState(false);

  const uploadConverter = useReceiptConverter(file, settings);
  const manualConverter = useManualReceipt(order, settings);
  const converter = mode === "manual" ? manualConverter : uploadConverter;

  const handleFileSelected = (newFile) => {
    setSettings((prev) => ({ ...prev, pageNumber: 1, pageRange: "" }));
    setFile(newFile);
  };

  const updateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  const canPrint = printer.status === PRINTER_STATUS.CONNECTED && converter.status === "ready";

  if (!unlocked) {
    return <LicenseGate onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <Header onOpenTutorial={() => setShowTutorial(true)} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Pemilih mode: unggah file resi atau ketik manual */}
        <div className="mb-6 inline-flex rounded-lg border border-ink-900/10 bg-white p-1 shadow-card">
          <ModeTab active={mode === "upload"} onClick={() => setMode("upload")} icon={Upload}>
            Unggah File
          </ModeTab>
          <ModeTab active={mode === "manual"} onClick={() => setMode("manual")} icon={PenLine}>
            Input Manual
          </ModeTab>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Kolom kiri: kontrol printer, sumber resi, lalu tombol cetak */}
          <div className="space-y-6">
            <PrinterPanel printer={printer} />
            {mode === "upload" ? (
              <FileUploader file={file} onFileSelected={handleFileSelected} />
            ) : (
              <OrderForm order={order} onChange={setOrder} />
            )}
            <PrintControls
              printer={printer}
              bitmap={converter.bitmap}
              file={mode === "manual" ? null : file}
              settings={{ ...settings, pageCount: uploadConverter.pageCount }}
              disabled={!canPrint}
            />
          </div>

          {/* Kolom kanan: preview & pengaturan konversi */}
          <ReceiptPreview
            file={mode === "manual" ? null : file}
            mode={mode}
            settings={settings}
            onSettingsChange={updateSettings}
            converter={converter}
          />
        </div>
      </main>

      <TutorialModal open={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}

function ModeTab({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-signal text-white" : "text-ink-700 hover:bg-paper-100"
      )}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}
