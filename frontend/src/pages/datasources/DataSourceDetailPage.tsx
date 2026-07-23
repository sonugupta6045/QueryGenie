import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Database, Server, Trash2, Play } from 'lucide-react';
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

  // Fetch single datasource (or filter from list, but for robustness we refetch or use standard react-query pattern)
  // For simplicity, we just use a direct query here since useDataSources doesn't expose a 'get single' by default
  const { data: dataSource, isLoading, error: fetchError } = useQuery({
    queryKey: ['dataSource', dataSourceId],
    queryFn: async () => {
      // In a real app we'd have a getById endpoint. 
      // Since Phase 2 spec didn't explicitly list GET /datasources/{id}, 
      // we'll filter the list for now.
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
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Database className="h-8 w-8 text-primary-main" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dataSource.name}</h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <Server className="w-4 h-4 mr-1" />
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
      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setIsEditing(false)}
              className={`${
                !isEditing
                  ? 'border-primary-main text-primary-main'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`${
                isEditing
                  ? 'border-primary-main text-primary-main'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  <h3 className="text-sm font-medium text-gray-500">Connection Details</h3>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Host:</span>
                      <span className="font-medium text-gray-900">{dataSource.dbHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Port:</span>
                      <span className="font-medium text-gray-900">{dataSource.dbPort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Database:</span>
                      <span className="font-medium text-gray-900">{dataSource.dbName}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Metadata</h3>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created At:</span>
                      <span className="font-medium text-gray-900">{formatDate(dataSource.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated At:</span>
                      <span className="font-medium text-gray-900">{formatDate(dataSource.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-800">Delete Data Source</p>
                    <p className="text-sm text-red-600 mt-1">This will permanently delete the connection and clear the schema cache.</p>
                  </div>
                  {isDeleting ? (
                    <div className="flex space-x-2">
                      <button onClick={() => setIsDeleting(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">Cancel</button>
                      <button onClick={handleDelete} disabled={isDeletePending} className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50">Confirm Delete</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsDeleting(true)} className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-md bg-white hover:bg-red-50 flex items-center">
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