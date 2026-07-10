import { toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, Loader2 } from "lucide-react";
import { cn } from "./utils"; // Assuming you have standard shadcn cn util

type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "premium" | "loading";

interface CustomToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: string; text: string }> = {
  default: {
    bg: "bg-white/70 dark:bg-zinc-900/70",
    border: "border-zinc-200/50 dark:border-zinc-800/50",
    icon: "text-zinc-600 dark:text-zinc-400",
    text: "text-zinc-900 dark:text-zinc-100",
  },
  success: {
    bg: "bg-emerald-50/70 dark:bg-emerald-950/70",
    border: "border-emerald-200/50 dark:border-emerald-900/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  error: {
    bg: "bg-rose-50/70 dark:bg-rose-950/70",
    border: "border-rose-200/50 dark:border-rose-900/50",
    icon: "text-rose-600 dark:text-rose-400",
    text: "text-rose-900 dark:text-rose-100",
  },
  warning: {
    bg: "bg-amber-50/70 dark:bg-amber-950/70",
    border: "border-amber-200/50 dark:border-amber-900/50",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-900 dark:text-amber-100",
  },
  info: {
    bg: "bg-blue-50/70 dark:bg-blue-950/70",
    border: "border-blue-200/50 dark:border-blue-900/50",
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-900 dark:text-blue-100",
  },
  premium: {
    bg: "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30",
    border: "border-purple-200/50 dark:border-purple-800/50",
    icon: "text-purple-600 dark:text-purple-400",
    text: "text-zinc-900 dark:text-zinc-100",
  },
  loading: {
    bg: "bg-slate-50/70 dark:bg-slate-900/70",
    border: "border-slate-200/50 dark:border-slate-800/50",
    icon: "text-slate-600 dark:text-slate-400",
    text: "text-slate-900 dark:text-slate-100",
  },
};

const Icons: Record<ToastVariant, React.FC<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  premium: Sparkles,
  loading: Loader2,
};

export const showToast = ({ title, description, variant = "default", duration = 4000, action }: CustomToastProps) => {
  const Icon = Icons[variant];
  const styles = variantStyles[variant];

  return sonnerToast.custom(
    (t) => (
      <div
        className={cn(
          "w-full max-w-sm pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all",
          "flex items-start gap-4",
          styles.bg,
          styles.border
        )}
      >
        <div className={cn("mt-0.5 shrink-0", variant === "loading" && "animate-spin")}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>

        <div className="flex-1 space-y-1">
          <p className={cn("text-sm font-semibold tracking-wide", styles.text)}>{title}</p>
          {description && (
            <p className={cn("text-sm opacity-90", styles.text)}>
              {description}
            </p>
          )}
        </div>

        {action && (
          <button
            onClick={() => {
              action.onClick();
              sonnerToast.dismiss(t);
            }}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:opacity-80",
              "bg-white/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-100 border border-black/5 dark:border-white/5"
            )}
          >
            {action.label}
          </button>
        )}

        <button
          onClick={() => sonnerToast.dismiss(t)}
          className={cn(
            "shrink-0 rounded-full p-1 opacity-50 hover:opacity-100 transition-opacity",
            styles.text
          )}
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration }
  );
};

export const toast = {
  success: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "success", ...options }),
  error: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "error", ...options }),
  warning: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "warning", ...options }),
  info: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "info", ...options }),
  premium: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "premium", ...options }),
  loading: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "loading", ...options }),
  default: (title: string, options?: Omit<CustomToastProps, "title" | "variant">) => showToast({ title, variant: "default", ...options }),
  dismiss: sonnerToast.dismiss,
};
