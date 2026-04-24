import React, { useState } from "react";

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "green" | "red" | "yellow";
export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const cls: Record<BadgeVariant, string> = {
    green:  "bg-success/10 text-success border border-success/25",
    red:    "bg-danger/15 text-danger border border-danger/35",
    yellow: "bg-caution/12 text-caution border border-caution/30",
  };
  return (
    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${cls[variant]}`}>
      {children}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = "green" | "red" | "yellow" | "dim";
interface BtnProps {
  variant?: BtnVariant;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  small?: boolean;
  className?: string;
}
export function Btn({ variant = "dim", onClick, disabled, children, small, className = "" }: BtnProps) {
  const base = "inline-flex items-center justify-center border cursor-pointer font-ui font-semibold uppercase tracking-widest transition-all duration-150 rounded-md whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed";
  const size = small ? "px-2 py-0.5 text-[9px]" : "px-4 py-1.5 text-[13px]";
  const v: Record<BtnVariant, string> = {
    green:  "border-success text-success bg-success/7 hover:bg-success/18",
    red:    "border-danger text-danger bg-danger/7 hover:bg-danger/18",
    yellow: "border-caution text-caution bg-caution/7",
    dim:    "border-border2 text-muted hover:border-content hover:text-content",
  };
  return (
    <button className={`${base} ${size} ${v[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── TreeNode ─────────────────────────────────────────────────────────────────
interface TreeNodeProps {
  label: string;
  rows: [string, string, (string | undefined)?][];
  defaultOpen?: boolean;
}
export function TreeNode({ label, rows, defaultOpen = false }: TreeNodeProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer border transition-all
          ${open ? "border-accent bg-accent/5" : "bg-panel2 border-border1 hover:border-border2"}`}
      >
        <span className={`text-[9px] text-muted transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        <span className="font-mono text-[10px] text-content">{label}</span>
      </div>
      {open && (
        <div className="pl-4 pt-1 pb-1">
          {rows.map(([k, v, c], i) => (
            <div key={i} className="flex gap-2 px-2 py-[3px] font-mono text-[10px] rounded hover:bg-white/[0.03]">
              <span className="text-muted min-w-[100px] flex-shrink-0">{k}</span>
              <span className={`break-all ${c === "red" ? "text-danger" : "text-content"}`}>
                {String(v ?? "").replace(/</g, "&lt;")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PanelHeader ───────────────────────────────────────────────────────────────
export function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-2.5 text-[10px] tracking-[3px] text-muted uppercase font-mono border-b border-border1 bg-panel2 flex-shrink-0">
      {children}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon, title }: { icon?: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted text-center p-8">
      {icon && <div className="text-4xl opacity-20">{icon}</div>}
      <div className="text-[13px] tracking-widest font-mono uppercase">{title}</div>
    </div>
  );
}

// ── ConnBadge ─────────────────────────────────────────────────────────────────
export function ConnBadge({ status, text }: { status: "live" | "dead" | "wait"; text: string }) {
  const cls = {
    live: "text-success border-success/40 bg-success/7",
    dead: "text-danger border-danger/40 bg-danger/7",
    wait: "text-caution border-caution/40 bg-caution/7",
  };
  const dotCls = {
    live: "bg-success animate-blink",
    dead: "bg-danger",
    wait: "bg-caution animate-blink",
  };
  return (
    <div className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest px-3 py-1 rounded-full border ${cls[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls[status]}`} />
      {text}
    </div>
  );
}
