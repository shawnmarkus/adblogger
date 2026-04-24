export interface Packet {
  id: string;
  no: number;
  time: string;
  app: string;
  proto: string;
  protoColor?: string;
  method: string;
  host: string;
  url: string;
  destIp?: string;
  destPort?: string | number;
  srcIp?: string;
  size?: number;
  info: string;
  risk: "low" | "high" | "critical";
  raw: string;
  isUpload?: boolean;
  sessionKey?: string;
  headers?: Record<string, string>;
  body?: string;
  sensitive?: Array<{ label: string; key: string }>;
  geo?: { city?: string; country?: string; isp?: string };
}

export interface Device {
  id: string;
  model: string;
}

export interface Session {
  key: string;
  app: string;
  host: string;
  packets: number[];
  bytes: number;
  startTs: number;
  lastTs: number;
}

export interface Connection {
  localIp: string;
  localPort: number;
  remoteIp: string;
  remotePort: number;
  state: string;
}

export interface AppStat {
  uid: string;
  iface?: string;
  rxBytes: number;
  txBytes: number;
}

export type ViewId =
  | "packets"
  | "apps"
  | "connections"
  | "streams"
  | "graphs"
  | "alerts";

export type ConnectionStatus = "live" | "dead" | "wait";
