import type { Packet } from "../types";
import { getFriendlyAppName } from "./appNames";

export function matchesFilter(
  p: Packet,
  displayFilter: string,
  appFilter: string | null,
  protoFilterSet: Set<string>
): boolean {
  if (appFilter && p.app !== appFilter) return false;
  if (
    p.proto &&
    protoFilterSet.size > 0 &&
    !protoFilterSet.has(p.proto) &&
    !protoFilterSet.has("DATA")
  )
    return false;

  const f = displayFilter.toLowerCase().trim();
  if (!f) return true;

  const checks = f.split(/\s+and\s+/);
  return checks.every((check) => {
    const m = check.match(/^([a-z._]+)\s*([=!><]+)\s*(.+)$/);
    if (m) {
      const [, field, op, val] = m;
      const cleanVal = val.replace(/^["']|["']$/g, "");
      let pval = (String((p as Record<string, unknown>)[field] ?? "")).toLowerCase();
      if (field === "app")
        pval = getFriendlyAppName(p.app).toLowerCase() + " " + pval;
      if (op === "==" || op === "=") return pval.includes(cleanVal);
      if (op === ">" && !isNaN(Number(cleanVal)))
        return parseFloat(pval) > parseFloat(cleanVal);
      if (op === "<" && !isNaN(Number(cleanVal)))
        return parseFloat(pval) < parseFloat(cleanVal);
    }
    return [
      getFriendlyAppName(p.app),
      p.app,
      p.url,
      p.host,
      p.destIp ?? "",
      p.proto,
      p.method,
      p.info,
      p.risk,
    ]
      .join(" ")
      .toLowerCase()
      .includes(check);
  });
}
