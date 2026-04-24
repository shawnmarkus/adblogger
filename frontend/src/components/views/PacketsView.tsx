import React, { useMemo, useState } from "react";
import { Empty } from "../ui";
import { matchesFilter } from "../../utils/filters";
import { getFriendlyAppName } from "../../utils/appNames";
import type { Packet } from "../../types";

const PROTO_COLORS: Record<string, string> = {
  HTTP:  "#00e676", HTTPS: "#00b8d4", DNS: "#aa88ff",
  TLS:   "#7c4dff", WS:    "#ffab40", TCP: "#40c4ff",
  UDP:   "#b2ff59",
};

const ALL_PROTOS = ["HTTP","HTTPS","DNS","TLS","WS","TCP","UDP"];
const MAX_VIS = 500;

const QUICK_FILTERS = [
  { q: "risk==critical",  desc: "Show only critical risk alerts" },
  { q: "risk==high",      desc: "Show high risk traffic" },
  { q: "method==POST",    desc: "Show data uploads (POST)" },
  { q: "proto==DNS",      desc: "Show domain name lookups" },
  { q: "size>1000",       desc: "Packets larger than 1KB" },
  { q: "app==WhatsApp",   desc: "Traffic from a specific app" },
  { q: "tracker",         desc: "Free text search for trackers" },
];

interface Props {
  allPackets: Packet[];
  appFilter: string | null;
  onSelectPacket: (p: Packet) => void;
  selectedPacketId: string | null;
}

export default function PacketsView({ allPackets, appFilter, onSelectPacket, selectedPacketId }: Props) {
  const [displayFilter, setDisplayFilter] = useState("");
  const [protoSet, setProtoSet]           = useState(new Set(ALL_PROTOS));
  const [showHelp, setShowHelp]           = useState(false);

  const filtered = useMemo(() => {
    return allPackets
      .filter(p => matchesFilter(p, displayFilter, appFilter, protoSet))
      .slice(0, MAX_VIS);
  }, [allPackets, displayFilter, appFilter, protoSet]);

  const toggleProto = (p: string) => {
    setProtoSet(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-panel2 border-b border-border1 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-wide text-content flex items-center gap-2">
          📦 Live Packet Inspector
        </div>
        <button className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border2 text-muted hover:text-accent hover:border-accent">
          ? HELP
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border1 bg-black/20 relative flex-shrink-0">
        <input
          className="flex-1 bg-black/35 border border-border2 rounded text-content font-mono text-[11px] px-3 py-1.5 outline-none focus:border-accent transition-colors"
          placeholder="Filter: risk==high · method==POST · ip==8.8.8.8"
          value={displayFilter}
          onChange={e => setDisplayFilter(e.target.value)}
          onFocus={() => !displayFilter && setShowHelp(true)}
          onBlur={() => setTimeout(() => setShowHelp(false), 200)}
        />
        <span className="font-mono text-[10px] text-muted whitespace-nowrap">{filtered.length} pkts</span>

        {showHelp && (
          <div className="absolute top-full left-4 mt-1 bg-panel2 border border-border2 rounded-md shadow-2xl w-[400px] z-[1000] overflow-hidden">
            <div className="px-2.5 pt-2 pb-1 text-[9px] text-muted font-mono tracking-[2px] uppercase">Quick Filters</div>
            {QUICK_FILTERS.map(({ q, desc }) => (
              <div
                key={q}
                onClick={() => { setDisplayFilter(q); setShowHelp(false); }}
                className="flex justify-between px-2.5 py-2 font-mono text-[10px] cursor-pointer border-b border-border1 text-content hover:bg-accent/8 hover:text-accent"
              >
                <span className="text-accent font-normal">{q}</span>
                <span className="text-muted font-ui text-[11px]">{desc}</span>
              </div>
            ))}
            <div className="px-2.5 py-1 text-[10px] text-muted font-mono border-t border-border1">
              Use <strong>and</strong> to combine: <code className="text-accent">risk==high and method==POST</code>
            </div>
          </div>
        )}
      </div>

      {/* Protocol chips */}
      <div className="flex gap-2 flex-wrap px-4 py-1.5 border-b border-border1 bg-black/20 flex-shrink-0">
        {ALL_PROTOS.map(p => (
          <span
            key={p}
            onClick={() => toggleProto(p)}
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer tracking-[0.5px] transition-opacity
              ${protoSet.has(p) ? "opacity-100" : "opacity-35"}`}
            style={{ color: PROTO_COLORS[p], borderColor: PROTO_COLORS[p] }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <Empty icon="📡" title="Waiting for Traffic" />
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-[5] bg-[rgba(3,10,16,0.99)]">
              <tr>
                {["NO","TIME","APP","PROTO","METHOD","DESTINATION","LEN","INFO"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-[2px] text-muted border-b border-border1 uppercase cursor-pointer hover:text-accent whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <PacketRow
                  key={p.id}
                  pkt={p}
                  selected={p.id === selectedPacketId}
                  onClick={() => onSelectPacket(p)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PacketRow({ pkt, selected, onClick }: { pkt: Packet; selected: boolean; onClick: () => void }) {
  const app   = getFriendlyAppName(pkt.app);
  const appD  = app.length > 18 ? app.slice(0, 16) + "…" : app;
  const dst   = `${pkt.destIp ?? pkt.host ?? "?"}:${pkt.destPort ?? "?"}`;
  const info  = (pkt.info ?? "").length > 45 ? (pkt.info ?? "").slice(0, 45) + "…" : (pkt.info ?? "");

  const riskCls = pkt.risk === "critical" ? "risk-critical" : pkt.risk === "high" ? "risk-high" : "";
  return (
    <tr
      className={`row-${pkt.proto} ${riskCls} ${selected ? "selected" : ""} cursor-pointer`}
      onClick={onClick}
    >
      <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{pkt.no}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] text-muted border-b border-border1/60">{pkt.time.slice(-8)}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-content border-b border-border1/60">{appD}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] border-b border-border1/60" style={{ color: pkt.protoColor ?? "#fff" }}>{pkt.proto}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{pkt.method}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] text-[#6699aa] border-b border-border1/60">{dst}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] text-accent border-b border-border1/60">{pkt.size ?? 0}</td>
      <td className="px-3 py-1.5 font-mono text-[10px] text-content border-b border-border1/60">{info}</td>
    </tr>
  );
}
