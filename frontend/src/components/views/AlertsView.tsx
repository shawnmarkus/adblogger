import { Empty } from "../ui";
import { getFriendlyAppName } from "../../utils/appNames";
import type { Packet } from "../../types";

interface Props {
  alertsList: Packet[];
}

export default function AlertsView({ alertsList }: Props) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-panel2 border-b border-border1 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-wide text-danger">🚨 Security Alerts</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {alertsList.length === 0 ? (
          <Empty icon="✅" title="No High-Risk Events" />
        ) : alertsList.map((a, i) => (
          <div
            key={i}
            className={`flex gap-3 px-4 py-3 rounded-md mb-2.5 items-start border
              ${a.risk === "critical"
                ? "border-danger bg-danger/8"
                : "border-warn/60 bg-warn/6"}`}
          >
            <span className="text-xl mt-0.5">🚨</span>
            <div>
              <div className={`text-[13px] font-bold mb-1 ${a.risk === "critical" ? "text-danger" : "text-warn"}`}>
                {a.risk.toUpperCase()} Risk: {getFriendlyAppName(a.app)}
              </div>
              <div className="font-mono text-[10px] text-content leading-relaxed">
                {a.info}
                <br />
                Host: {a.host || a.destIp}
              </div>
              <div className="font-mono text-[9px] text-muted mt-1">{a.time} · {a.proto}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
