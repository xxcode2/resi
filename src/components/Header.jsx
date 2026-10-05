import { Printer, BookOpen } from "lucide-react";

export default function Header({ onOpenTutorial }) {
  return (
    <header className="border-b border-ink-900/10 bg-paper-50">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-white">
          <Printer size={20} />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold leading-tight text-ink-900">
            XYZ Thermal
          </h1>
          <p className="text-xs text-ink-500">Cetak resi marketplace langsung dari browser, cepat dan praktis</p>
        </div>
        <button
          onClick={onOpenTutorial}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-card transition-colors hover:border-signal/40 hover:text-signal"
        >
          <BookOpen size={14} />
          Cara Pakai
        </button>
      </div>
    </header>
  );
}
