import { useEffect, useRef, useState, useCallback } from "react";
import type { Packet } from "../../types";

const FULL_PTS = 300;
const GRID_PTS = 60;

interface Histories {
  rate: number[];
  bw:   number[];
  risk: number[];
}

interface Props {
  allPackets: Packet[];
  ppsBucket:  React.MutableRefObject<number>;
  bwBucket:   React.MutableRefObject<number>;
  riskBucket: React.MutableRefObject<number>;
}

function calcStats(a: number[]) {
  return {
    cur: a[a.length - 1] ?? 0,
    max: Math.max(...a, 0),
    avg: a.reduce((s, b) => s + b, 0) / (a.length || 1),
  };
}

function drawLine(canvas: HTMLCanvasElement | null, data: number[], color: string, fill: string) {
  if (!canvas) return;
  const W = canvas.parentElement!.clientWidth;
  const H = canvas.parentElement!.clientHeight;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  if (data.every(v => v === 0)) return;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: i * (W / (data.length - 1 || 1)),
    y: H - (v / max) * (H - 4),
  }));
  // filled area
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(W, H); ctx.lineTo(0, H);
  ctx.fillStyle = fill; ctx.fill();
  // line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}

function drawProto(canvas: HTMLCanvasElement | null, packets: Packet[]) {
  if (!canvas || !packets.length) return;
  const W = canvas.parentElement!.clientWidth;
  const H = canvas.parentElement!.clientHeight;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const counts: Record<string, number> = {};
  packets.forEach(p => { counts[p.proto] = (counts[p.proto] ?? 0) + 1; });
  const colors: Record<string, string> = {
    HTTP:"#00e676", HTTPS:"#00b8d4", DNS:"#aa88ff",
    TLS:"#7c4dff", TCP:"#40c4ff", UDP:"#b2ff59",
  };
  let x = 0;
  Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([p, n]) => {
    const w = (n / packets.length) * W;
    ctx.fillStyle = colors[p] ?? "#607d8b";
    ctx.fillRect(x + 1, 0, w - 2, H - 20);
    if (w > 30) {
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.font = "bold 10px JetBrains Mono";
      ctx.fillText(p, x + 6, 16);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(String(n), x + 6, 30);
    }
    x += w;
  });
}

export default function GraphsView({ allPackets, ppsBucket, bwBucket, riskBucket }: Props) {
  const [hist, setHist] = useState<Histories>({
    rate: new Array(FULL_PTS).fill(0),
    bw:   new Array(FULL_PTS).fill(0),
    risk: new Array(FULL_PTS).fill(0),
  });
  const [expanded, setExpanded] = useState<keyof Histories | "proto" | null>(null);
  const [viewOffset, setViewOffset] = useState(0);
  const dragging = useRef(false);

  const rateRef  = useRef<HTMLCanvasElement>(null);
  const bwRef    = useRef<HTMLCanvasElement>(null);
  const riskRef  = useRef<HTMLCanvasElement>(null);
  const protoRef = useRef<HTMLCanvasElement>(null);
  const egMain   = useRef<HTMLCanvasElement>(null);
  const egMini   = useRef<HTMLCanvasElement>(null);

  // tick every second
  useEffect(() => {
    const id = setInterval(() => {
      setHist(prev => ({
        rate: [...prev.rate.slice(1), ppsBucket.current],
        bw:   [...prev.bw.slice(1),   bwBucket.current / 1024],
        risk: [...prev.risk.slice(1), riskBucket.current],
      }));
      ppsBucket.current  = 0;
      bwBucket.current   = 0;
      riskBucket.current = 0;
    }, 1000);
    return () => clearInterval(id);
  }, [ppsBucket, bwBucket, riskBucket]);

  const cfg = {
    rate: { h: hist.rate, c: "#00ffe7", f: "rgba(0,255,231,0.15)" },
    bw:   { h: hist.bw,   c: "#ff6600", f: "rgba(255,102,0,0.15)"  },
    risk: { h: hist.risk, c: "#ff3355", f: "rgba(255,51,85,0.15)"  },
  };

  // draw grid
  useEffect(() => {
    if (expanded) return;
    (["rate","bw","risk"] as const).forEach(k => {
      const sl = cfg[k].h.slice(-GRID_PTS);
      drawLine(
        k === "rate" ? rateRef.current : k === "bw" ? bwRef.current : riskRef.current,
        sl, cfg[k].c, cfg[k].f
      );
    });
    drawProto(protoRef.current, allPackets);
  });

  // draw expanded
  useEffect(() => {
    if (!expanded) return;
    if (expanded === "proto") {
      drawProto(egMain.current, allPackets);
      return;
    }
    const c = cfg[expanded as keyof Histories];
    const slice = c.h.slice(FULL_PTS - GRID_PTS - viewOffset, FULL_PTS - viewOffset);
    drawLine(egMain.current, slice, c.c, c.f);
    // minimap
    const mc = egMini.current;
    if (mc) {
      drawLine(mc, c.h, c.c, "rgba(255,255,255,0.05)");
      const ctx = mc.getContext("2d")!;
      const W   = mc.width;
      const hlW = W * (GRID_PTS / FULL_PTS);
      const hlX = W - hlW - W * (viewOffset / FULL_PTS);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(hlX, 0, hlW, mc.height);
      ctx.strokeStyle = c.c; ctx.lineWidth = 1;
      ctx.strokeRect(hlX, 0, hlW, mc.height);
    }
  });

  const GRID_CARDS = [
    { key: "rate" as const, label: "Packet Rate",      color: "#00ffe7", ref: rateRef  },
    { key: "bw"   as const, label: "Upload Bandwidth", color: "#ff6600", ref: bwRef    },
    { key: "risk" as const, label: "Risk Events",      color: "#ff3355", ref: riskRef  },
    { key: "proto" as const,label: "Protocol Usage",   color: "#8866ff", ref: protoRef },
  ];

  const handleMinimap = useCallback((clientX: number, rect: DOMRect) => {
    let o = Math.round(FULL_PTS - ((clientX - rect.left) / rect.width) * FULL_PTS + GRID_PTS / 2);
    o = Math.max(0, Math.min(o, FULL_PTS - GRID_PTS));
    setViewOffset(o);
  }, []);

  const expandedCfg = expanded && expanded !== "proto" ? cfg[expanded as keyof Histories] : null;
  const expandedSt  = expandedCfg
    ? calcStats(expandedCfg.h.slice(FULL_PTS - GRID_PTS - viewOffset, FULL_PTS - viewOffset))
    : null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-panel2 border-b border-border1 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-wide text-content">📊 Live Metrics &amp; Analysis</div>
      </div>

      {/* Grid */}
      {!expanded && (
        <div className="grid grid-cols-2 grid-rows-2 gap-4 p-4 flex-1 min-h-0">
          {GRID_CARDS.map(card => {
            const st = card.key !== "proto" ? calcStats(cfg[card.key as keyof Histories].h.slice(-GRID_PTS)) : null;
            return (
              <div key={card.key} className="bg-panel2 border border-border1 rounded-lg overflow-hidden flex flex-col min-h-0">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border1 bg-black/20 flex-shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: card.color }}>{card.label}</span>
                  {st && (
                    <span className="font-mono text-[9px] text-muted">
                      Curr: {st.cur.toFixed(1)} | Peak: {st.max.toFixed(1)}
                    </span>
                  )}
                  <button
                    className="text-[9px] font-mono px-2 py-0.5 rounded border border-border2 text-muted hover:border-content hover:text-content"
                    onClick={() => setExpanded(card.key)}
                  >
                    ⤢ EXPAND
                  </button>
                </div>
                <div className="flex-1 relative min-h-0">
                  <canvas ref={card.ref} className="absolute inset-0 w-full h-full" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="flex flex-col flex-1 bg-panel2 p-4">
          <div className="flex justify-between items-start border-b border-border1 pb-3 mb-4 flex-shrink-0">
            <div>
              <div className="text-[18px] font-bold tracking-wide capitalize" style={{ color: expandedCfg?.c ?? "#8866ff" }}>
                {GRID_CARDS.find(c => c.key === expanded)?.label}
              </div>
              {expandedSt && (
                <div className="font-mono text-[11px] text-muted mt-1.5">
                  Current: {expandedSt.cur.toFixed(1)} | Peak: {expandedSt.max.toFixed(1)} | Avg: {expandedSt.avg.toFixed(1)}
                </div>
              )}
              {expanded === "proto" && (
                <div className="font-mono text-[11px] text-muted mt-1.5">Total Packets: {allPackets.length}</div>
              )}
            </div>
            <button
              className="text-[13px] font-mono px-4 py-1.5 rounded border border-border2 text-muted hover:border-content hover:text-content font-semibold uppercase tracking-widest"
              onClick={() => { setExpanded(null); setViewOffset(0); }}
            >
              ◀ BACK TO GRID
            </button>
          </div>

          {/* Main chart */}
          <div className="flex-1 relative min-h-0 mb-4 border border-border1 bg-black/20 rounded overflow-hidden">
            <canvas ref={egMain} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Minimap */}
          {expanded !== "proto" && (
            <div className="flex-shrink-0">
              <div className="flex justify-between font-mono text-[9px] text-muted mb-1.5 tracking-[2px]">
                <span>MINIMAP (FULL 5-MINUTE HISTORY)</span>
                <span className="text-accent text-[8px]">DRAG TO SCROLL TIME</span>
              </div>
              <div
                className="h-[60px] relative border border-border1 bg-black/30 rounded overflow-hidden cursor-ew-resize"
                onMouseDown={e => {
                  dragging.current = true;
                  handleMinimap(e.clientX, e.currentTarget.getBoundingClientRect());
                }}
                onMouseMove={e => {
                  if (dragging.current) handleMinimap(e.clientX, e.currentTarget.getBoundingClientRect());
                }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
              >
                <canvas ref={egMini} className="absolute inset-0 w-full h-full pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
