import { useState, useMemo } from "react";
import { Empty } from "../ui";
import { getFriendlyAppName, fmtBytes } from "../../utils/appNames";
import type { Packet, Session } from "../../types";

interface Props {
  allPackets: Packet[];
  sessions: Record<string, Session>;
}

export default function StreamsView({ allPackets, sessions }: Props) {
  const [selKey, setSelKey] = useState<string | null>(null);

  const sorted = useMemo(
    () => Object.values(sessions).sort((a, b) => b.lastTs - a.lastTs).slice(0, 50),
    [sessions]
  );

  const streamPkts = useMemo(
    () => selKey
      ? allPackets.filter(p => p.sessionKey === selKey).slice(0, 100).reverse()
      : [],
    [allPackets, selKey]
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Session list */}
      <div className="w-[300px] border-r border-border1 overflow-y-auto bg-panel2">
        {sorted.length === 0 ? (
          <div className="p-5 text-center text-muted text-[11px] font-mono">No sessions</div>
        ) : sorted.map(s => (
          <div
            key={s.key}
            onClick={() => setSelKey(s.key)}
            className={`px-3.5 py-2.5 border-b border-border1 cursor-pointer
              ${selKey === s.key ? "bg-accent/8 border-l-2 border-l-accent" : "hover:bg-accent/4"}`}
          >
            <div className="text-[12px] font-bold text-content break-all">{s.host || s.key.split("::")[1]}</div>
            <div className="flex justify-between font-mono text-[9px] mt-1">
              <span className="text-muted">{getFriendlyAppName(s.app)}</span>
              <span className="text-warn">{fmtBytes(s.bytes)} ↑</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stream detail */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selKey ? (
          <Empty icon="🌊" title="Select a session on the left" />
        ) : (
          <>
            <div className="mb-4 border-b border-border1 pb-2.5">
              <h3 className="text-accent text-[16px] font-bold mb-1">
                {sessions[selKey]?.host ?? selKey}
              </h3>
              <div className="font-mono text-[10px] text-muted">
                {getFriendlyAppName(sessions[selKey]?.app ?? "")} · {streamPkts.length} pkts
              </div>
            </div>
            {streamPkts.map(p => (
              <div
                key={p.id}
                className={`p-3 rounded-md mb-1.5 border-l-2 font-mono
                  ${p.isUpload
                    ? "bg-warn/5 border-l-warn"
                    : "bg-accent/4 border-l-accent"}`}
              >
                <div className="flex justify-between text-[9px] text-muted mb-1">
                  <span>{p.time} · {p.proto}</span>
                  <span>{p.size ?? 0}B</span>
                </div>
                <div className="text-[10px] text-content">{p.info}</div>
                {p.body && (
                  <div className="mt-1.5 text-[9px] text-caution">{p.body.slice(0, 150)}</div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
