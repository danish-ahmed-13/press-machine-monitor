import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import LiveFeed from "../components/LiveFeed";
import ProductivityChart from "../components/ProductivityChart";
import ViolationsTable from "../components/ViolationsTable";
import { fetchMetrics, fetchViolations, startSession, stopSession } from "../api";

export default function Dashboard() {
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem("session_id");
    return saved ? parseInt(saved) : null;
  });
  const [metrics, setMetrics]         = useState(null);
  const [violations, setViolations]   = useState([]);
  const [sessionTime, setSessionTime] = useState("--");

  // fetch metrics + violations every 5 seconds when session is active
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      try {
        const m = await fetchMetrics(sessionId);
        const v = await fetchViolations(sessionId);
        setMetrics(m);
        setViolations(v);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // session timer
  useEffect(() => {
    if (!sessionId || !metrics?.started_at) return;
    const startTime = new Date(metrics.started_at).getTime();
    const timer = setInterval(() => {
      const diff = Date.now() - startTime;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setSessionTime(`${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, metrics?.started_at]);

  const handleStartSession = async () => {
    const data = await startSession("Ahmed", "Line A");
    setSessionId(data.session_id);
    localStorage.setItem("session_id", data.session_id);
  };

  const handleStopSession = async () => {
    await stopSession(sessionId);
    setSessionId(null);
    setMetrics(null);
    setViolations([]);
    setSessionTime("--");
    localStorage.removeItem("session_id");
  };

  const activeViolations = violations.filter(v => !v.resolved).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <span className={`w-2 h-2 rounded-full ${sessionId ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
        <h1 className="text-sm font-medium text-gray-800">Press machine monitor</h1>
        <span className="text-xs text-gray-400">— Machine line A · Shift 1</span>
        <div className="ml-auto flex items-center gap-3">
          {sessionId && (
            <>
              <span className="text-xs text-gray-400">Session active {sessionTime}</span>
              {activeViolations > 0 && (
                <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeViolations} violations
                </span>
              )}
            </>
          )}
          {!sessionId ? (
            <button
              onClick={handleStartSession}
              className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors"
            >
              Start shift
            </button>
          ) : (
            <button
              onClick={handleStopSession}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              End shift
            </button>
          )}
        </div>
      </header>

      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-gray-400 text-sm">No active session</p>
          <button
            onClick={handleStartSession}
            className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start shift
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              label="Press cycles"
              value={metrics?.total_cycles ?? "—"}
              sub="live count"
              subColor="text-gray-400"
            />
            <StatCard
              label="Machine utilization"
              value={metrics ? `${Math.min(100, Math.round((metrics.total_cycles / 320) * 100))}%` : "—"}
              sub="Target: 320 cycles"
              subColor="text-gray-400"
            />
            <StatCard
              label="PPE violations"
              value={activeViolations}
              sub={activeViolations > 0 ? "Action needed" : "All clear"}
              valueColor={activeViolations > 0 ? "text-red-500" : "text-emerald-600"}
              subColor={activeViolations > 0 ? "text-red-400" : "text-emerald-500"}
            />
            <StatCard
              label="Session time"
              value={sessionTime}
              sub={`Session #${sessionId}`}
              subColor="text-gray-400"
            />
          </div>

          <div className="flex-1 grid grid-cols-5 gap-3" style={{ minHeight: 0 }}>
            <div className="col-span-3 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
              <LiveFeed />
            </div>
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
              <ProductivityChart data={metrics?.hourly_cycles?.map(h => ({
                hour: h.hour,
                cycles: h.cycles
              })) ?? []} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3" style={{ height: "160px" }}>
            <div className="col-span-3 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
              <ViolationsTable violations={violations.map(v => ({
                id:         v.id,
                time:       v.detected_at.slice(11, 16),
                type:       v.violation_type.replace(/_/g, " "),
                status:     v.resolved ? "resolved" : "active",
                operatorId: v.operator_name
              }))} compact />
            </div>
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Session info</p>
              {[
                ["Session ID",   `#${sessionId}`],
                ["Machine",      metrics?.machine_line ?? "—"],
                ["Total cycles", metrics?.total_cycles ?? "—"],
                ["Started at",   metrics?.started_at?.slice(11, 16) ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{k}</span>
                  <span className="text-xs text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}