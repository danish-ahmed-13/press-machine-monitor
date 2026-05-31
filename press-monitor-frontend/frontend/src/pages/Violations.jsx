import ViolationsTable from "../components/ViolationsTable";

export default function Violations() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-sm font-medium text-gray-800">Violations</h1>
        <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full ml-auto">3 today</span>
      </header>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="bg-white border border-gray-100 rounded-xl h-full overflow-hidden flex flex-col">
          <ViolationsTable />
        </div>
      </div>
    </div>
  );
}
