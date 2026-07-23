import { useNavigate } from 'react-router-dom';
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
        <h1 className="text-2xl font-bold text-gray-900">Add Data Source</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect a new PostgreSQL database to QueryGenie.
        </p>
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