import { PanelHeader, Empty } from "./ui";
import { getFriendlyAppName } from "../utils/appNames";
import type { Packet } from "../types";

interface Props {
  allPackets: Packet[];
  appFilter: string | null;
  onFilterApp: (pkg: string) => void;
}

export default function LeftPanel({ allPackets, appFilter, onFilterApp }: Props) {
  const counts: Record<string, number> = {};
  const risks:  Record<string, number> = {};

  for (const p of allPackets) {
    counts[p.app] = (counts[p.app] ?? 0) + 1;
    if (p.risk === "high" || p.risk === "critical")
      risks[p.app] = (risks[p.app] ?? 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  return (
    <div className="w-[220px] border-r border-border1 flex flex-col bg-[rgba(5,12,20,0.7)]">
      <PanelHeader>Active Apps Filter</PanelHeader>
      <div className="flex-1 overflow-y-auto p-1.5">
        {sorted.length === 0 ? (
          <Empty title="Start monitoring to detect apps" />
        ) : (
          sorted.map(([app, n]) => {
            const isSys = getFriendlyAppName(app).startsWith("OS:");
            const sel   = app === appFilter;
            return (
              <div
                key={app}
                onClick={() => onFilterApp(app)}
                className={`flex items-center justify-between px-2 py-1.5 rounded mb-0.5 border cursor-pointer transition-all
                  ${sel
                    ? "bg-accent/8 border-accent"
                    : "border-transparent hover:bg-accent/4 hover:border-border1"}
                  ${isSys ? "opacity-60" : ""}`}
              >
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-content tracking-[0.5px] truncate">
                    {getFriendlyAppName(app)}
                  </div>
                  <div className="font-mono text-[9px] text-muted mt-0.5 truncate max-w-[140px]">{app}</div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-success/8 text-success border border-success/25">{n}</span>
                  {risks[app] ? (
                    <span className="font-mono text-[9px] px-1.5 rounded-lg bg-danger/15 text-danger border border-danger/35">{risks[app]}!</span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
