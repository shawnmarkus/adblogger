import { Empty } from "../ui";
import type { Connection, AppStat } from "../../types";

interface Props {
  connections: Connection[];
  appStats: AppStat[];
}

function fmtBytes(b: number) {
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + " MB";
  if (b > 1024)        return (b / 1024).toFixed(1) + " KB";
  return b + " B";
}

export default function ConnectionsView({ connections, appStats }: Props) {
  const active = connections.filter(c => c.state === "ESTABLISHED" || c.state === "SYN_SENT");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-panel2 border-b border-border1 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-wide text-content">🔌 Live Socket Table</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active TCP connections */}
        <div className="px-4 py-2 font-mono text-[10px] text-muted tracking-[3px] uppercase border-b border-border1 bg-transparent mt-1">
          Active TCP Connections ({active.length})
        </div>

        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[5] bg-[rgba(3,10,16,0.99)]">
            <tr>
              {["PROTO","LOCAL","REMOTE IP","PORT","STATE"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-[2px] text-muted border-b border-border1 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-4 text-center text-muted font-mono text-[10px]">No active connections</td></tr>
            ) : active.map((c, i) => (
              <tr key={i} className="hover:bg-accent/3">
                <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">TCP</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{c.localIp}:{c.localPort}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-accent border-b border-border1/60">{c.remoteIp}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{c.remotePort}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] border-b border-border1/60">
                  <span className={c.state === "ESTABLISHED" ? "text-success" : "text-caution"}>{c.state}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* App bandwidth (requires root) */}
        <div className="px-4 py-2 font-mono text-[10px] text-muted tracking-[3px] uppercase border-b border-border1 bg-transparent mt-5">
          Kernel App Bandwidth
        </div>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[5] bg-[rgba(3,10,16,0.99)]">
            <tr>
              {["UID","INTERFACE","RX (↓)","TX (↑)"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-[2px] text-muted border-b border-border1 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appStats.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-muted font-mono text-[10px]">Requires Root</td></tr>
            ) : appStats.filter(s => s.txBytes > 0).sort((a,b) => b.txBytes - a.txBytes).slice(0, 50).map((s, i) => (
              <tr key={i} className="hover:bg-accent/3">
                <td className="px-3 py-1.5 font-mono text-[10px] text-muted border-b border-border1/60">{s.uid}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{s.iface ?? "?"}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-success border-b border-border1/60">{fmtBytes(s.rxBytes)}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-warn border-b border-border1/60">{fmtBytes(s.txBytes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
