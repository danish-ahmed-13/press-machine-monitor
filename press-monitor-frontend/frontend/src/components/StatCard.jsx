export default function StatCard({ label, value, sub, subColor = "text-gray-400", valueColor = "text-gray-900" }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-medium leading-none ${valueColor}`}>{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${subColor}`}>{sub}</p>}
    </div>
  );
}
