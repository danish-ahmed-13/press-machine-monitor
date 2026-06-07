import { useState, useEffect } from "react";
import { fetchAllSessions } from "../api";

export default function Reports() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllSessions();
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCycles     = sessions.reduce((sum, s) => sum + (s.total_cycles || 0), 0);
  const totalViolations = sessions.reduce((sum, s) => sum + (s.violation_count || 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-sm font-medium text-gray-800">Reports</h1>
        <span className="text-xs text-gray-400 ml-auto">{sessions.length} sessions total</span>
      </header>

      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-3">

        {/* summary cards */}
        <div className="grid grid-cols-3 gap-3 flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Total sessions</p>
            <p className="text-2xl font-medium text-gray-900">{sessions.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Total cycles</p>
            <p className="text-2xl font-medium text-gray-900">{totalCycles}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Total violations</p>
            <p className={`text-2xl font-medium ${totalViolations > 0 ? "text-red-500" : "text-emerald-600"}`}>
              {totalViolations}
            </p>
          </div>
        </div>

        {/* sessions table */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
            <span className="text-xs font-medium text-gray-500">All sessions</span>
          </div>
          <div className="overflow-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400">Loading...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400">No sessions yet</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-left sticky top-0">
                    <th className="px-4 py-2.5 font-medium">Session</th>
                    <th className="px-4 py-2.5 font-medium">Operator</th>
                    <th className="px-4 py-2.5 font-medium">Machine</th>
                    <th className="px-4 py-2.5 font-medium">Started</th>
                    <th className="px-4 py-2.5 font-medium">Cycles</th>
                    <th className="px-4 py-2.5 font-medium">Violations</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-400">#{s.id}</td>
                      <td className="px-4 py-2.5 text-gray-700">{s.operator_name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{s.machine_line}</td>
                      <td className="px-4 py-2.5 text-gray-400">{s.started_at.slice(11, 16)}</td>
                      <td className="px-4 py-2.5 text-gray-700 font-medium">{s.total_cycles}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.violation_count > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {s.violation_count}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.ended_at ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"
                        }`}>
                          {s.ended_at ? "Completed" : "Active"}
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
