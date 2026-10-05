import { useCallback, useRef, useState } from "react";
import { FileUp, FileText, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

/**
 * Sebagian file resi dari marketplace tidak membawa MIME type yang benar
 * (hasil rename, ekstrak zip, atau kirim lewat chat), jadi tipe file saja
 * tidak cukup — ekstensi dipakai sebagai cadangan supaya tidak ditolak.
 */
function isAccepted(file) {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  return ACCEPTED_EXT.some((ext) => (file.name || "").toLowerCase().endsWith(ext));
}

export default function FileUploader({ file, onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const selected = fileList?.[0];
      if (!selected) return;
      if (!isAccepted(selected)) {
        setError("Format tidak didukung. Unggah file PDF, PNG, atau JPG.");
        return;
      }
      setError(null);
      onFileSelected(selected);
    },
    [onFileSelected]
  );

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-5 shadow-card">
      <h2 className="font-display text-base font-semibold text-ink-900">Resi</h2>
      <p className="mt-1 text-xs text-ink-500">Unggah file PDF atau gambar resi dari marketplace.</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging ? "border-signal bg-signal/5" : "border-ink-900/15 hover:border-ink-900/25"
        )}
      >
        {file ? (
          <>
            {file.type === "application/pdf" ? (
              <FileText className="text-ink-700" size={24} />
            ) : (
              <ImageIcon className="text-ink-700" size={24} />
            )}
            <p className="text-sm font-medium text-ink-900">{file.name}</p>
            <p className="text-xs text-ink-500">Klik untuk mengganti file</p>
          </>
        ) : (
          <>
            <FileUp className="text-ink-500" size={24} />
            <p className="text-sm font-medium text-ink-900">Seret file ke sini, atau klik untuk pilih</p>
            <p className="text-xs text-ink-500">PDF, PNG, atau JPG</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-signal/5 px-3 py-2 text-xs text-signal">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          // reset supaya file yang sama bisa dipilih ulang setelah diganti
          e.target.value = "";
        }}
      />
    </div>
  );
}
