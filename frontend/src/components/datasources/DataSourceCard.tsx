import { Link } from 'react-router-dom';
import { Database, Clock, Server } from 'lucide-react';
import { DataSourceResponse } from '../../types/dataSource';
import { formatDate } from '../../utils/formatters';

interface DataSourceCardProps {
  dataSource: DataSourceResponse;
}

export default function DataSourceCard({ dataSource }: DataSourceCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-subtle border border-border flex items-center justify-center text-primary-main">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold text-text-primary truncate" title={dataSource.name}>
              {dataSource.name}
            </h3>
          </div>
        </div>
        
        <div className="space-y-2 mt-4 text-sm text-text-secondary">
          <div className="flex items-center">
            <Server className="h-4 w-4 mr-2 text-text-secondary opacity-70" />
            <span className="truncate">{dataSource.dbHost}:{dataSource.dbPort}</span>
          </div>
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2 text-text-secondary opacity-70" />
            <span className="truncate">{dataSource.dbName}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-text-secondary opacity-70" />
            <span>Updated {formatDate(dataSource.updatedAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-surface-secondary border-t border-border mt-auto flex justify-end">
        <Link 
          to={`/data-sources/${dataSource.id}`}
          className="text-sm font-semibold text-primary-main hover:text-primary-dark group-hover:underline"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
