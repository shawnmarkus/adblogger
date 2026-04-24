import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Packet, Device, Session, ConnectionStatus } from "../types";

const MAX_PACKETS = 10_000;
const MAX_ALERTS  = 50;
const MAX_RAW     = 300;
let _uid = 0;

export function useNetSpy() {
  const [allPackets,  setAllPackets]  = useState<Packet[]>([]);
  const [sessions,    setSessions]    = useState<Record<string, Session>>({});
  const [alertsList,  setAlertsList]  = useState<Packet[]>([]);
  const [devices,     setDevices]     = useState<Device[]>([]);
  const [currentPort, setCurrentPort] = useState(7474);
  const [connStatus,  setConnStatus]  = useState<ConnectionStatus>("dead");
  const [isCapturing, setIsCapturing] = useState(false);
  const [rawLines,    setRawLines]    = useState(0);
  const [rawLogs,     setRawLogs]     = useState<string[]>([]);

  // per-second buckets for graph sampling
  const ppsBucket  = useRef(0);
  const bwBucket   = useRef(0);
  const riskBucket = useRef(0);

  const processPacket = useCallback((raw: Omit<Packet, "id" | "info">) => {
    const pkt: Packet = {
      ...raw,
      id:   String(++_uid),
      info: raw.url || raw.host || raw.proto,
      size: raw.size ?? 0,
    };

    setAllPackets(prev => {
      const next = [pkt, ...prev];
      if (next.length > MAX_PACKETS) next.pop();
      return next;
    });

    if (pkt.sessionKey) {
      setSessions(prev => {
        const ex = prev[pkt.sessionKey!] ?? {
          key: pkt.sessionKey!, app: pkt.app, host: pkt.host,
          packets: [], bytes: 0, startTs: Date.now(), lastTs: Date.now(),
        };
        return {
          ...prev,
          [pkt.sessionKey!]: {
            ...ex,
            packets: [...ex.packets, pkt.no],
            bytes:   ex.bytes + (pkt.size ?? 0),
            lastTs:  Date.now(),
          },
        };
      });
    }

    if (pkt.risk === "critical" || pkt.risk === "high") {
      setAlertsList(prev => {
        const next = [pkt, ...prev];
        if (next.length > MAX_ALERTS) next.pop();
        return next;
      });
      riskBucket.current++;
    }

    ppsBucket.current++;
    bwBucket.current += pkt.size ?? 0;
  }, []);

  useEffect(() => {
    let unlisten1: (() => void) | undefined;
    let unlisten2: (() => void) | undefined;
    let unlisten3: (() => void) | undefined;

    const setup = async () => {
      try {
        const port = await invoke<number>("get_app_config");
        setCurrentPort(port);

        const initial = await invoke<Device[]>("get_devices");
        setDevices(initial);
        if (initial.length > 0) setConnStatus("wait");

        unlisten1 = await listen<Device[]>("devices-updated", (e) => {
          setDevices(e.payload);
          setConnStatus(e.payload.length > 0 ? "wait" : "dead");
        });

        unlisten2 = await listen<Omit<Packet, "id" | "info">>("packet-received", (e) => {
          processPacket(e.payload);
        });

        unlisten3 = await listen<string>("raw-log", (e) => {
          setRawLines(n => n + 1);
          setRawLogs(prev => {
            const next = [...prev, e.payload];
            if (next.length > MAX_RAW) next.shift();
            return next;
          });
        });
      } catch (err) {
        console.error("NetSpy init error:", err);
      }
    };

    setup();
    return () => {
      unlisten1?.();
      unlisten2?.();
      unlisten3?.();
    };
  }, [processPacket]);

  const startCapture = useCallback(async (deviceId: string) => {
    setConnStatus("live");
    setIsCapturing(true);
    await invoke("start_capture", { deviceId });
  }, []);

  const stopCapture = useCallback(() => {
    setIsCapturing(false);
    setConnStatus("wait");
  }, []);

  const clearData = useCallback(() => {
    setAllPackets([]);
    setSessions({});
    setAlertsList([]);
    setRawLines(0);
    setRawLogs([]);
  }, []);

  return {
    allPackets, sessions, alertsList, devices, currentPort,
    connStatus, isCapturing, rawLines, rawLogs,
    ppsBucket, bwBucket, riskBucket,
    startCapture, stopCapture, clearData,
  };
}
