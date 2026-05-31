import ProductivityChart from "../components/ProductivityChart";

const WEEKLY = [
  { hour: "Mon", cycles: 312 },
  { hour: "Tue", cycles: 287 },
  { hour: "Wed", cycles: 341 },
  { hour: "Thu", cycles: 298 },
  { hour: "Fri", cycles: 247, isCurrent: true },
];

export default function Reports() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-sm font-medium text-gray-800">Reports</h1>
      </header>
      <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-hidden">
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
          <ProductivityChart data={WEEKLY} />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Weekly summary</p>
          {[
            ["Total cycles",     "1,485"],
            ["Avg utilization",  "76%"],
            ["Total violations", "8"],
            ["Best day",         "Wednesday"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400">{k}</span>
              <span className="text-xs font-medium text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
