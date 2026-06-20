import { useState, useEffect, useRef } from "react";
import StatCard from "../components/StatCard";
import ProductivityChart from "../components/ProductivityChart";
import ViolationsTable from "../components/ViolationsTable";
import { fetchMetrics, fetchViolations, startSession, stopSession, uploadForStream, getStreamUrl } from "../api";

export default function Dashboard() {
  const [sessionId, setSessionId]     = useState(() => {
    const saved = localStorage.getItem("session_id");
    return saved ? parseInt(saved) : null;
  });
  const [metrics, setMetrics]         = useState(null);
  const [violations, setViolations]   = useState([]);
  const [sessionTime, setSessionTime] = useState("--");
  const [uploading, setUploading]     = useState(false);
  const [streamUrl, setStreamUrl]     = useState(null);
  const [streaming, setStreaming]     = useState(false);
  const fileRef = useRef(null);

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

  useEffect(() => {
    if (!sessionId) return;
    const start = Date.now();
    setSessionTime("0m 0s");
    const timer = setInterval(() => {
      const diff = Date.now() - start;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setSessionTime(`${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  const handleStartSession = async () => {
    const data = await startSession("Ahmed", "Line A");
    setSessionId(data.session_id);
    localStorage.setItem("session_id", data.session_id);
    setStreamUrl(null);
    setStreaming(false);
  };

  const handleStopSession = async () => {
    await stopSession(sessionId);
    setSessionId(null);
    setMetrics(null);
    setViolations([]);
    setSessionTime("--");
    setStreamUrl(null);
    setStreaming(false);
    localStorage.removeItem("session_id");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !sessionId) return;

    setUploading(true);
    setStreamUrl(null);
    try {
      const data = await uploadForStream(file);
      const url = getStreamUrl(data.video_path, sessionId);
      setStreamUrl(url);
      setStreaming(true);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
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

          {/* stat cards */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              label="Press cycles"
              value={metrics?.total_cycles ?? "—"}
              sub="live count"
              subColor="text-gray-400"
            />
            <StatCard
              label="Machine utilization"
              value={metrics ? `${Math.min(100, Math.round((metrics.total_cycles / 7) * 100))}%` : "—"}
              sub="Target: 7 cycles"
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

          {/* upload + live feed panel */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-shrink-0">
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700 mb-0.5">Live detection feed</p>
                <p className="text-xs text-gray-400">
                  {uploading
                    ? "Uploading video..."
                    : streaming
                    ? "Streaming live detections — press count updating in real time"
                    : "Upload a press machine video to see live cycle and PPE detection"}
                </p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => !uploading && fileRef.current.click()}
                disabled={uploading}
                className={`text-xs px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  uploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Uploading...
                  </span>
                ) : "Upload video"}
              </button>
            </div>

            {/* live stream display */}
            <div className="bg-black flex items-center justify-center" style={{ height: streamUrl ? "360px" : "0px", transition: "height 0.2s" }}>
              {streamUrl && (
                <img
                  src={streamUrl}
                  alt="Live detection feed"
                  className="max-h-full max-w-full"
                  onError={() => setStreaming(false)}
                />
              )}
            </div>
          </div>

          {/* chart */}
          <div className="flex-1 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
            <ProductivityChart data={metrics?.hourly_cycles?.map(h => ({
              hour: h.hour,
              cycles: h.cycles
            })) ?? []} />
          </div>

          {/* violations + session info */}
          <div className="grid grid-cols-5 gap-3" style={{ height: "180px" }}>
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
