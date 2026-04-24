import { PanelHeader, Empty, TreeNode } from "./ui";
import { getFriendlyAppName } from "../utils/appNames";
import type { Packet, ViewId } from "../types";

const VIEWS: { id: ViewId; icon: string; label: string }[] = [
  { id: "packets",     icon: "📦", label: "Packets"     },
  { id: "apps",        icon: "📱", label: "Apps"        },
  { id: "connections", icon: "🔌", label: "Connections" },
  { id: "streams",     icon: "🌊", label: "Streams"     },
  { id: "graphs",      icon: "📊", label: "Charts"      },
  { id: "alerts",      icon: "🚨", label: "Alerts"      },
];

interface Props {
  activeView: ViewId;
  onViewChange: (v: ViewId) => void;
  selectedPacket: Packet | null;
  badges: Record<string, number>;
}

export default function RightPanel({ activeView, onViewChange, selectedPacket, badges }: Props) {
  return (
    <div className="w-[320px] border-l border-border1 flex flex-col bg-[rgba(4,10,18,0.85)]">
      <PanelHeader>VIEWS</PanelHeader>

      {/* Nav */}
      <div className="p-2 border-b border-border1 flex-shrink-0">
        {VIEWS.map(v => (
          <div
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex items-center gap-2.5 px-3 py-2 mb-1 rounded-md border cursor-pointer text-[13px] font-semibold tracking-[0.5px] transition-all
              ${activeView === v.id
                ? "bg-accent/8 border-accent/30 text-accent"
                : "border-transparent text-content hover:bg-accent/4"}`}
          >
            <span className="text-base w-5 text-center">{v.icon}</span>
            {v.label}
            {badges[v.id] != null && (
              <span className={`ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-lg bg-panel2 
                ${v.id === "alerts" ? "text-danger" : "text-muted"}`}>
                {badges[v.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <PanelHeader>INSPECTOR</PanelHeader>
      <div className="flex-1 overflow-y-auto p-3">
        {selectedPacket ? <PacketDetail pkt={selectedPacket} /> : (
          <Empty icon="🔍" title="Select Packet" />
        )}
      </div>
    </div>
  );
}

function PacketDetail({ pkt }: { pkt: Packet }) {
  const appName = getFriendlyAppName(pkt.app);
  const geo = pkt.geo
    ? `${pkt.geo.city ?? ""} ${pkt.geo.country ?? ""} · ${pkt.geo.isp ?? ""}`.trim()
    : "Resolving…";

  return (
    <div>
      {/* App banner */}
      <div className="flex items-center gap-3 p-2.5 bg-accent/5 border border-accent rounded-md mb-3">
        <span className="text-xl drop-shadow-[0_0_5px_rgba(0,255,231,1)]">📱</span>
        <div className="overflow-hidden">
          <div className="text-[13px] font-bold text-content tracking-[0.5px]">{appName}</div>
          <div className="font-mono text-[9px] text-muted truncate">{pkt.app}</div>
        </div>
      </div>

      <TreeNode label={`Frame Info  #${pkt.no} · ${pkt.proto}`} defaultOpen rows={[
        ["Sequence", String(pkt.no)],
        ["Time",     pkt.time],
        ["Protocol", pkt.proto],
        ["Risk",     (pkt.risk || "low").toUpperCase(), pkt.risk === "critical" ? "red" : undefined],
      ]} />

      <TreeNode label={`Network  ${pkt.srcIp ?? "dev"} → ${pkt.destIp ?? "?"}`} rows={[
        ["Source",      pkt.srcIp  ?? "dev"],
        ["Destination", pkt.destIp ?? "?"],
        ["Port",        String(pkt.destPort ?? "?")],
        ["GeoIP",       geo],
      ]} />

      <TreeNode label={`Application  ${pkt.method} ${pkt.host}`} rows={[
        ["Method", pkt.method],
        ["Host",   pkt.host  || "—"],
        ["URL",    pkt.url   || "—"],
      ]} />

      {pkt.headers && Object.keys(pkt.headers).length > 0 && (
        <TreeNode label={`Headers  ${Object.keys(pkt.headers).length} keys`} rows={Object.entries(pkt.headers)} />
      )}

      {pkt.body && (
        <TreeNode label={`Payload  ${pkt.body.length} chars`} rows={[["Body", pkt.body]]} />
      )}

      {pkt.sensitive && pkt.sensitive.length > 0 && (
        <TreeNode label={`Sensitive Data  ${pkt.sensitive.length} items`} defaultOpen rows={
          pkt.sensitive.map(s => [s.label, s.key, "red"] as [string, string, string])
        } />
      )}

      <TreeNode label="Raw Logcat" rows={[["Raw", pkt.raw]]} />
    </div>
  );
}
