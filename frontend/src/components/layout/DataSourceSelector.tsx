import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database } from 'lucide-react';
import { useDataSources } from '../../hooks/useDataSources';
import { RootState } from '../../store/store';
import { setSelectedDataSource } from '../../store/slices/uiSlice';

export default function DataSourceSelector() {
  const dispatch = useDispatch();
  const selectedDataSourceId = useSelector((state: RootState) => state.ui.selectedDataSourceId);
  const { data, isLoading } = useDataSources();

  const dataSources = data?.content || [];

  // Auto-select first data source if none selected
  useEffect(() => {
    if (!isLoading && dataSources.length > 0 && !selectedDataSourceId) {
      dispatch(setSelectedDataSource(dataSources[0].id));
    }
  }, [isLoading, dataSources, selectedDataSourceId, dispatch]);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading data sources...</div>;
  }

  if (dataSources.length === 0) {
    return <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">No data sources available</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Database size={16} className="text-gray-500" />
      <select
        value={selectedDataSourceId || ''}
        onChange={(e) => dispatch(setSelectedDataSource(Number(e.target.value)))}
        className="text-sm font-medium text-text-primary bg-surface border border-border rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main appearance-none shadow-sm transition-colors"
      >
        <option value="" disabled>Select Database</option>
        {dataSources.map((ds) => (
          <option key={ds.id} value={ds.id}>
            {ds.name} ({ds.dbName} @ {ds.dbHost}:{ds.dbPort})
          </option>
        ))}
      </select>
    </div>
  );
}
