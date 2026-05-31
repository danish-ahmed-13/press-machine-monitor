const MOCK_VIOLATIONS = [
  { id: 1, time: "11:42", type: "No helmet", status: "active",   operatorId: "OP-01" },
  { id: 2, time: "09:15", type: "No vest",   status: "resolved", operatorId: "OP-01" },
  { id: 3, time: "08:33", type: "No gloves", status: "resolved", operatorId: "OP-02" },
];

const statusStyle = {
  active:   "bg-red-50 text-red-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

export default function ViolationsTable({ violations = MOCK_VIOLATIONS, compact = false }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs font-medium text-gray-500">PPE violation log</span>
        <span className="text-xs text-gray-400">Today</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-left">
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Type</th>
              {!compact && <th className="px-3 py-2 font-medium">Operator</th>}
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">View</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => (
              <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 text-gray-400">{v.time}</td>
                <td className="px-3 py-2 text-gray-700">{v.type}</td>
                {!compact && <td className="px-3 py-2 text-gray-500">{v.operatorId}</td>}
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[v.status]}`}>
                    {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button className="text-blue-500 hover:text-blue-700 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
