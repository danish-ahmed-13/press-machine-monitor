import { useState, useEffect } from "react";
import { fetchAllViolations } from "../api";

const statusStyle = {
  active:   "bg-red-50 text-red-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllViolations();
        setViolations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const active   = violations.filter(v => !v.resolved).length;
  const resolved = violations.filter(v => v.resolved).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-sm font-medium text-gray-800">PPE Violations</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {active} active
          </span>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {resolved} resolved
          </span>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-hidden">
        <div className="bg-white border border-gray-100 rounded-xl h-full overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400">Loading...</p>
              </div>
            ) : violations.length === 0 ? (
              <div className="flex items-center justify-center h-full flex-col gap-2">
                <p className="text-emerald-600 text-sm font-medium">No violations recorded</p>
                <p className="text-xs text-gray-400">All PPE checks passed</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-left sticky top-0">
                    <th className="px-4 py-2.5 font-medium">Time</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Operator</th>
                    <th className="px-4 py-2.5 font-medium">Session</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v) => (
                    <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-400">{v.detected_at.slice(11, 16)}</td>
                      <td className="px-4 py-2.5 text-gray-700 capitalize">{v.violation_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2.5 text-gray-600">{v.operator_name}</td>
                      <td className="px-4 py-2.5 text-gray-400">#{v.session_id}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[v.resolved ? "resolved" : "active"]}`}>
                          {v.resolved ? "Resolved" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
