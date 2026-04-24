import { useState, useMemo } from "react";
import { Empty } from "../ui";
import { getFriendlyAppName, fmtBytes } from "../../utils/appNames";
import type { Packet } from "../../types";

interface Props {
  allPackets: Packet[];
  onSelectPacket: (p: Packet) => void;
}

export default function AppsView({ allPackets, onSelectPacket }: Props) {
  const [selApp, setSelApp] = useState<string | null>(null);

  const appData = useMemo(() => {
    const counts: Record<string, number> = {};
    const upload: Record<string, number> = {};
    const risk:   Record<string, number> = {};
    for (const p of allPackets) {
      counts[p.app] = (counts[p.app] ?? 0) + 1;
      if (p.isUpload) upload[p.app] = (upload[p.app] ?? 0) + (p.size ?? 0);
      if (p.risk === "high" || p.risk === "critical")
        risk[p.app] = (risk[p.app] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => {
        const aOs = getFriendlyAppName(a[0]).startsWith("OS:");
        const bOs = getFriendlyAppName(b[0]).startsWith("OS:");
        if (aOs && !bOs) return 1;
        if (!aOs && bOs) return -1;
        return b[1] - a[1];
      })
      .map(([app, n]) => ({ app, n, upload: upload[app] ?? 0, risk: risk[app] ?? 0 }));
  }, [allPackets]);

  const selPkts = useMemo(
    () => selApp ? allPackets.filter(p => p.app === selApp).slice(0, 150) : [],
    [allPackets, selApp]
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* App list */}
      <div className="w-[300px] border-r border-border1 overflow-y-auto bg-panel2">
        {appData.length === 0 ? (
          <Empty title="No Apps Detected" />
        ) : appData.map(({ app, n, upload, risk }) => (
          <div
            key={app}
            onClick={() => setSelApp(app)}
            className={`px-3.5 py-2.5 border-b border-border1 cursor-pointer transition-colors
              ${selApp === app ? "bg-accent/8 border-l-2 border-l-accent" : "hover:bg-accent/4"}
              ${getFriendlyAppName(app).startsWith("OS:") ? "opacity-60" : ""}`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="text-[11px] font-bold text-content truncate max-w-[180px]">
                {getFriendlyAppName(app)}
              </div>
              {risk > 0 && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-lg bg-danger/15 text-danger border border-danger/35">
                  {risk} Risk
                </span>
              )}
            </div>
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-warn">{fmtBytes(upload)} ↑</span>
              <span className="text-accent">{n} pkts</span>
            </div>
          </div>
        ))}
      </div>

      {/* App detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selApp ? (
          <Empty icon="📱" title="Select an App to view its logs" />
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border1 bg-black/20 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-bold text-content mb-1">{getFriendlyAppName(selApp)}</h2>
                <div className="text-muted font-mono text-[11px]">Package: {selApp}</div>
              </div>
              <div className="font-mono text-accent text-[14px] font-bold">{selPkts.length} Logs</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[rgba(3,10,16,0.99)] z-[5]">
                  <tr>
                    {["NO","TIME","PROTO","METHOD","DESTINATION","LEN"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-[2px] text-muted border-b border-border1 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selPkts.map(p => (
                    <tr key={p.id} onClick={() => onSelectPacket(p)} className={`row-${p.proto} cursor-pointer`}>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{p.no}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-muted border-b border-border1/60">{p.time.slice(-8)}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px] border-b border-border1/60" style={{ color: p.protoColor ?? "#fff" }}>{p.proto}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{p.method}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-[#6699aa] border-b border-border1/60">{p.destIp ?? p.host ?? "?"}</td>
                      <td className="px-3 py-1.5 font-mono text-[10px] text-accent border-b border-border1/60">{p.size ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
