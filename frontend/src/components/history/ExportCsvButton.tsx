import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { queryLogApi } from '../../api/queryLogApi';

interface ExportCsvButtonProps {
  logId: number;
}

export default function ExportCsvButton({ logId }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await queryLogApi.exportCsv(logId);
      
      // Create object url and download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query-results-${logId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleExport();
      }}
      disabled={isExporting}
      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 size={14} className="mr-1.5 animate-spin" />
      ) : (
        <Download size={14} className="mr-1.5" />
      )}
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
