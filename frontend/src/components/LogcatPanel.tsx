import { useRef, useEffect, useState } from "react";

interface Props {
  rawLines: number;
  rawLogs:  string[];
}

export default function LogcatPanel({ rawLines, rawLogs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [rawLogs, expanded]);

  return (
    <div
      className="border-t border-border1 bg-panel flex flex-col flex-shrink-0 transition-all duration-200"
      style={{ height: expanded ? "200px" : "32px" }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        className="px-5 py-1.5 text-[10px] font-mono text-muted flex justify-between cursor-pointer hover:text-content hover:bg-accent/[0.02] flex-shrink-0"
      >
        <span>
          📋 RAW ADB LOGCAT (Live Stream)
          <span className="text-accent ml-2.5">{rawLines} lines</span>
        </span>
        <span className="text-accent">{expanded ? "▼ COLLAPSE" : "▲ EXPAND"}</span>
      </div>

      {/* Body */}
      {expanded && (
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-5 py-2 bg-black/30 font-mono text-[10px]"
        >
          {rawLogs.map((line, i) => {
            const hot = /tracker|mixpanel|appsflyer/i.test(line);
            const net = /http|tcp/i.test(line);
            return (
              <div
                key={i}
                className={`whitespace-nowrap overflow-hidden text-ellipsis leading-[1.6]
                  ${hot ? "text-success" : net ? "text-[#408090]" : "text-[#2a5a70]"}`}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
