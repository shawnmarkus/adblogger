interface Props { active: boolean }

export default function ScanBar({ active }: Props) {
  return (
    <div className="h-[2px] bg-border1 overflow-hidden flex-shrink-0">
      {active ? (
        <div
          className="h-full w-1/4 animate-scan"
          style={{ background: "linear-gradient(90deg, #8866ff, #00ffe7)" }}
        />
      ) : (
        <div className="h-full w-1/4 opacity-30" style={{ background: "linear-gradient(90deg,#8866ff,#00ffe7)" }} />
      )}
    </div>
  );
}
