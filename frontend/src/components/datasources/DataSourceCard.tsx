import { Link } from 'react-router-dom';
import { Database, Clock, Server } from 'lucide-react';
import { DataSourceResponse } from '../../types/dataSource';
import { formatDate } from '../../utils/formatters';

interface DataSourceCardProps {
  dataSource: DataSourceResponse;
}

export default function DataSourceCard({ dataSource }: DataSourceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Database className="h-6 w-6 text-primary-main" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={dataSource.name}>
              {dataSource.name}
            </h3>
          </div>
        </div>
        
        <div className="space-y-2 mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Server className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{dataSource.dbHost}:{dataSource.dbPort}</span>
          </div>
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{dataSource.dbName}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>Updated {formatDate(dataSource.updatedAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 mt-auto flex justify-end">
        <Link 
          to={`/data-sources/${dataSource.id}`}
          className="text-sm font-medium text-primary-main hover:text-primary-dark group-hover:underline"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
