import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateDataSource } from '../../hooks/useDataSources';
import DataSourceForm from '../../components/datasources/DataSourceForm';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function DataSourceRegisterPage() {
  const navigate = useNavigate();
  const { mutate: createDataSource, error } = useCreateDataSource();

  const handleSubmit = (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
    createDataSource(values, {
      onSuccess: () => {
        navigate('/data-sources');
      },
      onSettled: () => {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/data-sources')}
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Data Sources
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Add Data Source</h1>
          <p className="mt-1 text-sm text-gray-600">
            Connect a new PostgreSQL database to QueryGenie.
          </p>
        </div>
      </div>

      {error && (
        <ErrorBanner error={(error as any)?.response?.data?.error} />
      )}

      <DataSourceForm 
        initialValues={{}}
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  );
}