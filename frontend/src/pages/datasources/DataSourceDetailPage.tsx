import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Database, Server, Trash2, Play, ArrowLeft } from 'lucide-react';
import { dataSourceApi } from '../../api/dataSourceApi';
import { useUpdateDataSource, useDeleteDataSource } from '../../hooks/useDataSources';
import { formatDate } from '../../utils/formatters';
import DataSourceForm from '../../components/datasources/DataSourceForm';
import SchemaRefreshButton from '../../components/datasources/SchemaRefreshButton';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function DataSourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dataSourceId = Number(id);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: dataSource, isLoading, error: fetchError } = useQuery({
    queryKey: ['dataSource', dataSourceId],
    queryFn: async () => {
      const res = await dataSourceApi.list(0, 100);
      const found = res.content.find((ds: any) => ds.id === dataSourceId);
      if (!found) throw new Error("Data source not found");
      return found;
    },
    enabled: !!dataSourceId
  });

  const { mutate: updateDataSource, error: updateError } = useUpdateDataSource();
  const { mutate: deleteDataSource, isPending: isDeletePending } = useDeleteDataSource();

  const handleUpdate = (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
    updateDataSource(
      { id: dataSourceId, data: values },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onSettled: () => {
          setSubmitting(false);
        }
      }
    );
  };

  const handleDelete = () => {
    deleteDataSource(dataSourceId, {
      onSuccess: () => {
        navigate('/data-sources');
      }
    });
  };

  if (isLoading) return <PageSpinner />;
  if (fetchError || !dataSource) return <ErrorBanner error={{ code: 'NOT_FOUND', message: 'Data source not found.' }} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/data-sources')}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors mb-1 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Data Sources
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary-subtle border border-border flex items-center justify-center text-primary-main">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{dataSource.name}</h1>
            <p className="mt-1 text-sm text-text-secondary flex items-center">
              <Server className="w-4 h-4 mr-1 text-text-secondary opacity-70" />
              {dataSource.dbHost}:{dataSource.dbPort}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {!isEditing && (
            <>
              <SchemaRefreshButton dataSourceId={dataSourceId} />
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-main hover:bg-primary-dark"
              >
                <Play size={16} className="mr-2" />
                Query
              </button>
            </>
          )}
        </div>
      </div>

      {(updateError) && (
        <ErrorBanner error={(updateError as any)?.response?.data?.error} />
      )}

      {/* Content */}
      <div className="bg-surface shadow rounded-xl border border-border overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setIsEditing(false)}
              className={`${
                !isEditing
                  ? 'border-primary-main text-primary-main'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`${
                isEditing
                  ? 'border-primary-main text-primary-main'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">Connection Details</h3>
                  <div className="mt-2 bg-surface-secondary border border-border rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Host:</span>
                      <span className="font-medium text-text-primary">{dataSource.dbHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Port:</span>
                      <span className="font-medium text-text-primary">{dataSource.dbPort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Database:</span>
                      <span className="font-medium text-text-primary">{dataSource.dbName}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">Metadata</h3>
                  <div className="mt-2 bg-surface-secondary border border-border rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Created At:</span>
                      <span className="font-medium text-text-primary">{formatDate(dataSource.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Updated At:</span>
                      <span className="font-medium text-text-primary">{formatDate(dataSource.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-danger mb-2">Danger Zone</h3>
                <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-lg flex items-center justify-between border border-red-200 dark:border-red-900/60">
                  <div>
                    <p className="text-sm font-medium text-danger">Delete Data Source</p>
                    <p className="text-sm text-danger opacity-90 mt-1">This will permanently delete the connection and clear the schema cache.</p>
                  </div>
                  {isDeleting ? (
                    <div className="flex space-x-2">
                      <button onClick={() => setIsDeleting(false)} className="px-3 py-1.5 bg-surface border border-border text-text-primary text-sm font-medium rounded-md hover:bg-surface-secondary">Cancel</button>
                      <button onClick={handleDelete} disabled={isDeletePending} className="px-3 py-1.5 bg-danger text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50">Confirm Delete</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsDeleting(true)} className="px-4 py-2 border border-red-300 dark:border-red-800 text-danger text-sm font-medium rounded-md bg-surface hover:bg-red-50 dark:hover:bg-red-950/60 flex items-center">
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <DataSourceForm 
              initialValues={dataSource}
              onSubmit={handleUpdate}
              isEditing={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}