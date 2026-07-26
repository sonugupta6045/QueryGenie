import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useDataSources } from '../../hooks/useDataSources';
import DataSourceCard from '../../components/datasources/DataSourceCard';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function DataSourceListPage() {
  const { data, isLoading, error } = useDataSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Data Sources</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your connected databases for AI querying.
          </p>
        </div>
        <Link
          to="/data-sources/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-primary-main hover:bg-primary-dark transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Data Source
        </Link>
      </div>

      {error && (
        <ErrorBanner error={(error as any)?.response?.data?.error} />
      )}

      {isLoading ? (
        <PageSpinner />
      ) : data?.content.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border shadow-sm">
          <Database className="mx-auto h-12 w-12 text-text-secondary" />
          <h3 className="mt-2 text-sm font-medium text-text-primary">No data sources</h3>
          <p className="mt-1 text-sm text-text-secondary">Get started by creating a new connection.</p>
          <div className="mt-6">
            <Link
              to="/data-sources/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-main hover:bg-primary-dark"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Data Source
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.content.map((ds) => (
            <DataSourceCard key={ds.id} dataSource={ds} />
          ))}
        </div>
      )}
    </div>
  );
}

// Needed just for empty state
import { Database } from 'lucide-react';