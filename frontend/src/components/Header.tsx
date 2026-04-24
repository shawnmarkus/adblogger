import React from "react";
import { Btn, ConnBadge } from "./ui";
import type { Device, ConnectionStatus } from "../types";

interface Props {
  devices: Device[];
  selectedDevice: string;
  onDeviceChange: (id: string) => void;
  connStatus: ConnectionStatus;
  isCapturing: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onExport: (fmt: string) => void;
  stats: { total: number; risk: number; kbOut: number; apps: number };
  currentPort: number;
}

export default function Header({
  devices, selectedDevice, onDeviceChange,
  connStatus, isCapturing,
  onStart, onStop, onClear, onExport,
  stats, currentPort,
}: Props) {
  const [exportOpen, setExportOpen] = React.useState(false);

  const statusText = connStatus === "live" ? "RUNNING" : connStatus === "wait" ? "READY" : "OFFLINE";

  return (
    <header className="flex items-center gap-4 px-5 h-[52px] border-b border-border1 bg-[rgba(4,11,18,0.98)] flex-shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 border border-accent/80 rounded-[7px] flex items-center justify-center text-base animate-glow shadow-[0_0_14px_rgba(0,255,231,0.35)]">
          ⬡
        </div>
        <div>
          <div className="text-[18px] font-bold tracking-[4px] text-accent font-ui leading-none">NETSPY</div>
          <div className="text-[9px] text-muted tracking-[2px] font-mono mt-0.5">v2.0 · COMMAND CENTER</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-1">
        <select
          value={selectedDevice}
          onChange={e => onDeviceChange(e.target.value)}
          className="bg-black/40 border border-border2 rounded-md text-content font-mono text-[11px] px-2.5 py-1.5 outline-none cursor-pointer min-w-[180px] focus:border-accent"
        >
          {devices.length === 0 ? (
            <option value="">— no device —</option>
          ) : (
            devices.map(d => (
              <option key={d.id} value={d.id}>{d.model} ({d.id})</option>
            ))
          )}
        </select>

        <Btn variant="green" onClick={onStart} disabled={isCapturing || devices.length === 0}>
          ▶ START
        </Btn>
        <Btn variant="red" onClick={onStop} disabled={!isCapturing}>
          ■ STOP
        </Btn>
        <Btn variant="dim" onClick={onClear}>
          ⊘ CLEAR
        </Btn>

        {/* Export dropdown */}
        <div className="relative" onMouseLeave={() => setExportOpen(false)}>
          <Btn variant="dim" onClick={() => setExportOpen(o => !o)}>
            ↓ EXPORT ▾
          </Btn>
          {exportOpen && (
            <div className="absolute top-full mt-1 left-0 bg-panel border border-border1 rounded-md shadow-xl z-[200] overflow-hidden min-w-[160px]">
              {["csv", "json", "pcap"].map(fmt => (
                <div
                  key={fmt}
                  onClick={() => { onExport(fmt); setExportOpen(false); }}
                  className="px-3.5 py-2 text-[11px] font-mono text-content cursor-pointer border-b border-border1 hover:bg-accent/10 hover:text-accent"
                >
                  Export {fmt.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex gap-2 items-center">
        {[
          { val: stats.total,  lab: "Pkts",  cls: "text-accent" },
          { val: stats.risk,   lab: "Risk",  cls: "text-danger" },
          { val: stats.kbOut,  lab: "KB↑",   cls: "text-caution" },
          { val: stats.apps,   lab: "Apps",  cls: "text-info" },
        ].map(({ val, lab, cls }) => (
          <div key={lab} className="flex flex-col items-center justify-center px-3 py-1 rounded-md border border-border1 bg-black/20 min-w-[56px]">
            <span className={`font-mono text-[14px] font-bold leading-none ${cls}`}>{val}</span>
            <span className="text-[9px] text-muted tracking-widest uppercase mt-0.5">{lab}</span>
          </div>
        ))}
        <ConnBadge status={connStatus} text={statusText} />
      </div>
    </header>
  );
}
