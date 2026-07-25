import { Database, Server, HardDrive, Eye, ChevronDown, CheckCircle2 } from 'lucide-react';
import { DataSourceResponse } from '../../types/dataSource';

interface ActiveDatabaseBannerProps {
  activeDataSource: DataSourceResponse | null;
  allDataSources: DataSourceResponse[];
  onSelectDataSource: (id: number) => void;
  onOpenSchemaInspector: () => void;
}

export default function ActiveDatabaseBanner({
  activeDataSource,
  allDataSources,
  onSelectDataSource,
  onOpenSchemaInspector,
}: ActiveDatabaseBannerProps) {
  if (!activeDataSource) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
          <Database size={18} className="text-amber-600" />
          <span>No database selected for AI querying</span>
        </div>
        {allDataSources.length > 0 && (
          <select
            onChange={(e) => onSelectDataSource(Number(e.target.value))}
            className="text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            defaultValue=""
          >
            <option value="" disabled>Choose a Database</option>
            {allDataSources.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name} ({ds.dbName})
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm shrink-0">
      {/* Left: Database Identifier & Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-main/20 border border-primary-main/30 flex items-center justify-center text-primary-light">
          <Database size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Query Target</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={10} /> Active Connection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">{activeDataSource.name}</h2>
          </div>
        </div>
      </div>

      {/* Center: Detailed Connection Specs */}
      <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 border-r border-slate-700 pr-3">
          <Server size={14} className="text-primary-light" />
          <span className="font-mono">{activeDataSource.dbHost}:{activeDataSource.dbPort}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <HardDrive size={14} className="text-emerald-400" />
          <span className="font-mono font-medium text-emerald-300">{activeDataSource.dbName}</span>
        </div>
      </div>

      {/* Right: Actions (Switcher & Schema Inspector) */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Quick Switcher Dropdown */}
        <div className="relative">
          <select
            value={activeDataSource.id}
            onChange={(e) => onSelectDataSource(Number(e.target.value))}
            className="appearance-none bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium pl-3 pr-8 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-main transition-colors cursor-pointer"
          >
            {allDataSources.map((ds) => (
              <option key={ds.id} value={ds.id} className="bg-slate-900 text-white py-1">
                {ds.name} ({ds.dbName})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Inspect Schema Button */}
        <button
          onClick={onOpenSchemaInspector}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary-main hover:bg-primary-dark text-white transition-colors shadow-xs"
        >
          <Eye size={14} />
          <span>Inspect Schema</span>
        </button>
      </div>
    </div>
  );
}
