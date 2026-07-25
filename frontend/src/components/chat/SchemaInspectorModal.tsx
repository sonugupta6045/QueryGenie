import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataSourceApi } from '../../api/dataSourceApi';
import { X, Search, Table, Columns, Database, RefreshCw, Key, Check } from 'lucide-react';

interface SchemaInspectorModalProps {
  dataSourceId: number;
  dataSourceName: string;
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
}

interface ColumnInfo {
  name: string;
  type: string;
}

interface ForeignKeyInfo {
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

interface TableInfo {
  name: string;
  columns?: ColumnInfo[];
  foreignKeys?: ForeignKeyInfo[];
}

export default function SchemaInspectorModal({
  dataSourceId,
  dataSourceName,
  isOpen,
  onClose,
  onInsertText,
}: SchemaInspectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { data: schemaJson, isLoading, isError, refetch } = useQuery({
    queryKey: ['schema', dataSourceId],
    queryFn: () => dataSourceApi.getSchema(dataSourceId),
    enabled: isOpen && !!dataSourceId,
  });

  const parsedSchema = useMemo(() => {
    if (!schemaJson) return { tables: [] };
    try {
      return typeof schemaJson === 'string' ? JSON.parse(schemaJson) : schemaJson;
    } catch (e) {
      console.error('Failed to parse schema JSON', e);
      return { tables: [] };
    }
  }, [schemaJson]);

  const filteredTables = useMemo(() => {
    const tables: TableInfo[] = parsedSchema.tables || [];
    if (!searchTerm.trim()) return tables;
    const term = searchTerm.toLowerCase();

    return tables.filter((table) => {
      const tableNameMatch = table.name.toLowerCase().includes(term);
      const columnMatch = table.columns?.some((c) => c.name.toLowerCase().includes(term));
      return tableNameMatch || columnMatch;
    });
  }, [parsedSchema, searchTerm]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleInsert = (text: string) => {
    if (onInsertText) {
      onInsertText(text);
    } else {
      handleCopy(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-main/10 text-primary-main flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Schema Inspector</h3>
              <p className="text-xs text-gray-500 truncate max-w-xs">{dataSourceName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 text-gray-500 hover:text-primary-main rounded-md hover:bg-gray-200/60 transition-colors"
              title="Refresh Schema"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200/60 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tables or columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
            />
          </div>
        </div>

        {/* Body / Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Introspecting schema from database...</p>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              Failed to load schema cache. Please click refresh to re-introspect.
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Table size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No tables found</p>
              <p className="text-xs text-gray-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTables.map((table) => (
              <div
                key={table.name}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:border-gray-300 transition-all shadow-xs"
              >
                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table size={16} className="text-primary-main" />
                    <span className="font-semibold text-gray-800 text-sm">{table.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                      {table.columns?.length || 0} cols
                    </span>
                  </div>
                  <button
                    onClick={() => handleInsert(table.name)}
                    className="text-xs text-primary-main hover:text-primary-dark font-medium flex items-center gap-1 hover:underline"
                    title="Insert table name into chat input"
                  >
                    {copiedText === table.name ? (
                      <>
                        <Check size={12} className="text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      'Insert'
                    )}
                  </button>
                </div>

                {/* Columns List */}
                <div className="p-3 space-y-1.5">
                  {table.columns?.map((col) => (
                    <div
                      key={col.name}
                      onClick={() => handleInsert(col.name)}
                      className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-colors"
                      title="Click to insert column into chat"
                    >
                      <div className="flex items-center gap-2">
                        <Columns size={13} className="text-gray-400 group-hover:text-primary-main" />
                        <span className="font-mono text-gray-700 group-hover:text-gray-900 font-medium">
                          {col.name}
                        </span>
                      </div>
                      <span className="font-mono text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {col.type}
                      </span>
                    </div>
                  ))}

                  {/* Foreign Keys if any */}
                  {table.foreignKeys && table.foreignKeys.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                      <div className="text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                        <Key size={12} /> Foreign Keys
                      </div>
                      {table.foreignKeys.map((fk, idx) => (
                        <div key={idx} className="text-[11px] text-gray-600 font-mono px-2 py-0.5">
                          {fk.fromColumn} &rarr; {fk.toTable}({fk.toColumn})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <span>{filteredTables.length} tables listed</span>
          <span>Click any table or column to insert it into chat</span>
        </div>
      </div>
    </div>
  );
}
