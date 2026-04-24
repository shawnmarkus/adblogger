import { useState, useMemo } from "react";
import { useNetSpy } from "./hooks/useNetSpy";
import Header from "./components/Header";
import ScanBar from "./components/ScanBar";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import LogcatPanel from "./components/LogcatPanel";
import PacketsView from "./components/views/PacketsView";
import AppsView from "./components/views/AppsView";
import ConnectionsView from "./components/views/ConnectionsView";
import StreamsView from "./components/views/StreamsView";
import GraphsView from "./components/views/GraphsView";
import AlertsView from "./components/views/AlertsView";
import type { ViewId, Packet, Connection, AppStat } from "./types";

export default function App() {
  const {
    allPackets, sessions, alertsList, devices, currentPort,
    connStatus, isCapturing, rawLines, rawLogs,
    ppsBucket, bwBucket, riskBucket,
    startCapture, stopCapture, clearData,
  } = useNetSpy();

  const [selectedDevice, setSelectedDevice] = useState("");
  const [activeView,     setActiveView]     = useState<ViewId>("packets");
  const [appFilter,      setAppFilter]      = useState<string | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);

  // Empty until the Rust side emits these (future extension)
  const connections: Connection[] = [];
  const appStats:    AppStat[]    = [];

  const stats = useMemo(() => ({
    total:  allPackets.length,
    risk:   alertsList.length,
    kbOut:  Math.round(allPackets.filter(p => p.isUpload).reduce((s, p) => s + (p.size ?? 0), 0) / 1024),
    apps:   new Set(allPackets.map(p => p.app)).size,
  }), [allPackets, alertsList]);

  const badges = {
    packets:     allPackets.length,
    apps:        new Set(allPackets.map(p => p.app)).size,
    streams:     Object.keys(sessions).length,
    alerts:      alertsList.length,
    connections: undefined,
    graphs:      undefined,
  } as Record<string, number>;

  const handleStart = () => {
    const id = selectedDevice || (devices[0]?.id ?? "");
    if (id) startCapture(id);
  };

  const handleFilterApp = (pkg: string) => {
    setAppFilter(prev => prev === pkg ? null : pkg);
  };

  const handleExport = (fmt: string) => {
    window.open(`http://localhost:${currentPort}/api/export/${fmt}`, "_blank");
  };

  return (
    <>
      <Header
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        connStatus={connStatus}
        isCapturing={isCapturing}
        onStart={handleStart}
        onStop={stopCapture}
        onClear={clearData}
        onExport={handleExport}
        stats={stats}
        currentPort={currentPort}
      />

      <ScanBar active={isCapturing} />

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          allPackets={allPackets}
          appFilter={appFilter}
          onFilterApp={handleFilterApp}
        />

        {/* Centre — view panels */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === "packets" && (
            <PacketsView
              allPackets={allPackets}
              appFilter={appFilter}
              onSelectPacket={p => { setSelectedPacket(p); }}
              selectedPacketId={selectedPacket?.id ?? null}
            />
          )}
          {activeView === "apps" && (
            <AppsView
              allPackets={allPackets}
              onSelectPacket={p => { setSelectedPacket(p); setActiveView("packets"); }}
            />
          )}
          {activeView === "connections" && (
            <ConnectionsView connections={connections} appStats={appStats} />
          )}
          {activeView === "streams" && (
            <StreamsView allPackets={allPackets} sessions={sessions} />
          )}
          {activeView === "graphs" && (
            <GraphsView
              allPackets={allPackets}
              ppsBucket={ppsBucket}
              bwBucket={bwBucket}
              riskBucket={riskBucket}
            />
          )}
          {activeView === "alerts" && (
            <AlertsView alertsList={alertsList} />
          )}
        </div>

        <RightPanel
          activeView={activeView}
          onViewChange={v => setActiveView(v)}
          selectedPacket={selectedPacket}
          badges={badges}
        />
      </div>

      <LogcatPanel rawLines={rawLines} rawLogs={rawLogs} />
    </>
  );
}
