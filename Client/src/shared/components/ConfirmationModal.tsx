import { AlertTriangle, Info, X } from "lucide-react";
import type { ReactNode } from "react";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  children?: ReactNode;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  confirmIcon?: ReactNode;
  note?: string;
};

const VARIANT_STYLES = {
  danger: {
    headerBg: "bg-red-50 dark:bg-red-950/40",
    iconBg: "bg-red-100 dark:bg-red-900/60",
    iconColor: "text-red-600 dark:text-red-300",
    noteBg: "bg-red-50 dark:bg-red-950/30",
    noteBorder: "border-red-200 dark:border-red-800/70",
    noteText: "text-red-700 dark:text-red-300",
    btnBg: "bg-red-500 hover:bg-red-600",
    btnShadow: "shadow-red-500/20",
  },
  warning: {
    headerBg: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
    iconColor: "text-amber-600 dark:text-amber-300",
    noteBg: "bg-amber-50 dark:bg-amber-950/20",
    noteBorder: "border-amber-200 dark:border-amber-800/70",
    noteText: "text-amber-700 dark:text-amber-300",
    btnBg: "bg-amber-500 hover:bg-amber-600",
    btnShadow: "shadow-amber-500/20",
  },
  primary: {
    headerBg: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/60",
    iconColor: "text-blue-600 dark:text-blue-300",
    noteBg: "bg-blue-50 dark:bg-blue-950/20",
    noteBorder: "border-blue-200 dark:border-blue-800/70",
    noteText: "text-blue-700 dark:text-blue-300",
    btnBg: "bg-[#001F3F] hover:bg-[#00162e]",
    btnShadow: "shadow-blue-900/20",
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  confirmIcon,
  note,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const v = VARIANT_STYLES[confirmVariant];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white dark:bg-[#0f1c33] rounded-2xl shadow-2xl overflow-hidden mx-4 border border-slate-100 dark:border-slate-700/60">
        {/* Header */}
        <div
          className={`p-6 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center ${v.headerBg}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${v.iconBg} flex items-center justify-center`}
            >
              {confirmVariant === "primary" ? (
                <Info className={`size-5 ${v.iconColor}`} />
              ) : (
                <AlertTriangle className={`size-5 ${v.iconColor}`} />
              )}
            </div>
            <h3 className="text-lg font-bold text-[#001F3F] dark:text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-300 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
            {description}
          </p>

          {children && <div className="mt-5">{children}</div>}

          {note && (
            <div
              className={`mt-5 p-3 rounded-lg ${v.noteBg} border ${v.noteBorder} flex items-start gap-2`}
            >
              <Info className={`size-4 ${v.noteText} mt-0.5 shrink-0`} />
              <p className={`text-xs ${v.noteText} leading-relaxed`}>{note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-200 uppercase hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 ${v.btnBg} text-white text-xs font-bold uppercase rounded-lg shadow-md ${v.btnShadow} transition-all hover:-translate-y-0.5 flex items-center gap-2`}
          >
            {confirmIcon}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
