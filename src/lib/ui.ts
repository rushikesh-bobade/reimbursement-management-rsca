import { cn } from "@/lib/utils";

/** Primary elevated panel: cards, tables, modals */
export const surfaceCard = cn(
  "rounded-2xl border border-surface-border/90 bg-surface-lowest",
  "shadow-[0_1px_2px_rgba(19,27,46,0.04),0_8px_24px_rgba(19,27,46,0.06)]"
);

/** Nested / inset blocks inside cards */
export const surfaceInset = "rounded-xl border border-surface-border/70 bg-surface-low/80";

/** Form controls in app shell */
export const fieldInput = cn(
  "w-full rounded-xl border border-surface-border/90 bg-surface-low px-4 py-2.5 text-sm text-on-surface",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "placeholder:text-on-surface-variant/50",
  "focus:border-primary/45 focus:bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary/12"
);

/** Consistent field labels */
export const fieldLabel = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant";
