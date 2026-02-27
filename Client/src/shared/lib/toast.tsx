import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

type ActionToastVariant = "success" | "error" | "info";

const variantConfig: Record<
  ActionToastVariant,
  { ring: string; iconBg: string; icon: string; text: string; pulse: string }
> = {
  success: {
    ring: "border-emerald-200",
    iconBg: "bg-emerald-500",
    icon: "✓",
    text: "text-emerald-700",
    pulse: "bg-emerald-300/45",
  },
  error: {
    ring: "border-red-200",
    iconBg: "bg-red-500",
    icon: "!",
    text: "text-red-700",
    pulse: "bg-red-300/45",
  },
  info: {
    ring: "border-blue-200",
    iconBg: "bg-blue-500",
    icon: "i",
    text: "text-blue-700",
    pulse: "bg-blue-300/45",
  },
};

const showCenteredActionToast = (
  message: ReactNode,
  variant: Exclude<ActionToastVariant, "info">,
) => {
  if (typeof document === "undefined") return;

  const mountNode = document.createElement("div");
  document.body.appendChild(mountNode);
  const root = createRoot(mountNode);

  root.render(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 backdrop-blur-[2px] pointer-events-none">
      <div className={`pointer-events-auto min-w-[290px] max-w-[88vw] rounded-2xl border ${variantConfig[variant].ring} bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}>
        <div className="flex flex-col items-center text-center gap-3">
          <span className="relative flex size-16 items-center justify-center">
            <span
              className={`absolute inline-flex size-16 animate-ping rounded-full ${variantConfig[variant].pulse}`}
            />
            <span
              className={`relative inline-flex size-14 items-center justify-center rounded-full ${variantConfig[variant].iconBg} text-3xl font-bold text-white shadow-md`}
            >
              {variantConfig[variant].icon}
            </span>
          </span>
          <p className={`text-base font-bold ${variantConfig[variant].text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>,
  );

  window.setTimeout(() => {
    root.unmount();
    mountNode.remove();
  }, 1450);
};

export const showSuccessToast = (message: ReactNode) =>
  showCenteredActionToast(message, "success");

export const showErrorToast = (message: ReactNode) =>
  showCenteredActionToast(message, "error");

export const showInfoToast = (message: ReactNode) =>
  toast.info(message, {
    duration: 1800,
  });
