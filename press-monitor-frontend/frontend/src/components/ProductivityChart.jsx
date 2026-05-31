import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const MOCK_DATA = [
  { hour: "08:00", cycles: 44 },
  { hour: "09:00", cycles: 64 },
  { hour: "10:00", cycles: 58 },
  { hour: "11:00", cycles: 72 },
  { hour: "12:00", cycles: 9, isBreak: true },
  { hour: "13:00", cycles: 61 },
  { hour: "Now",   cycles: 31, isCurrent: true },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-500">{payload[0].value} cycles</p>
    </div>
  );
}

export default function ProductivityChart({ data = MOCK_DATA }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs font-medium text-gray-500">Cycles per hour</span>
        <span className="text-xs text-gray-400">Today</span>
      </div>
      <div className="flex-1 px-2 py-3" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={18} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="cycles" radius={[3, 3, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isCurrent ? "#534AB7" : entry.isBreak ? "#EF9F27" : "#378ADD"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
