import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DataSourceCreateRequest } from '../../types/dataSource';

interface DataSourceFormProps {
  initialValues: Partial<DataSourceCreateRequest>;
  onSubmit: (values: DataSourceCreateRequest, setSubmitting: (isSubmitting: boolean) => void) => void;
  isEditing?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  dbHost: Yup.string().required('Required'),
  dbPort: Yup.number().positive().integer().required('Required'),
  dbName: Yup.string().required('Required'),
  dbUsername: Yup.string().required('Required'),
  // password is required for creation, optional for edit
});

export default function DataSourceForm({ initialValues, onSubmit, isEditing = false }: DataSourceFormProps) {
  const formik = useFormik<DataSourceCreateRequest>({
    initialValues: {
      name: initialValues.name || '',
      dbHost: initialValues.dbHost || '',
      dbPort: initialValues.dbPort || 5432,
      dbName: initialValues.dbName || '',
      dbUsername: initialValues.dbUsername || '',
      dbPassword: '', // Never pre-fill password
    },
    validationSchema: isEditing 
      ? validationSchema 
      : validationSchema.shape({ dbPassword: Yup.string().required('Required') }),
    onSubmit: (values, { setSubmitting }) => {
      // If editing and password is empty, don't send it
      const payload: any = { ...values };
      if (isEditing && !payload.dbPassword) {
        delete payload.dbPassword;
      }
      onSubmit(payload, setSubmitting);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="bg-surface px-4 py-5 shadow-sm sm:rounded-xl sm:p-6 border border-border">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold leading-6 text-text-primary">Database Connection</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Information needed to connect to your database. Currently PostgreSQL is supported.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              
              <div className="col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-text-primary">Display Name</label>
                <input
                  type="text"
                  id="name"
                  {...formik.getFieldProps('name')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                  placeholder="e.g. Production Analytics DB"
                />
                {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="dbHost" className="block text-sm font-medium text-text-primary">Host</label>
                <input
                  type="text"
                  id="dbHost"
                  {...formik.getFieldProps('dbHost')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.dbHost && formik.errors.dbHost ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                  placeholder="e.g. db.example.com"
                />
                {formik.touched.dbHost && formik.errors.dbHost && <p className="mt-1 text-xs text-red-500">{formik.errors.dbHost}</p>}
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="dbPort" className="block text-sm font-medium text-text-primary">Port</label>
                <input
                  type="number"
                  id="dbPort"
                  {...formik.getFieldProps('dbPort')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.dbPort && formik.errors.dbPort ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                />
                {formik.touched.dbPort && formik.errors.dbPort && <p className="mt-1 text-xs text-red-500">{formik.errors.dbPort}</p>}
              </div>

              <div className="col-span-6">
                <label htmlFor="dbName" className="block text-sm font-medium text-text-primary">Database Name</label>
                <input
                  type="text"
                  id="dbName"
                  {...formik.getFieldProps('dbName')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.dbName && formik.errors.dbName ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                />
                {formik.touched.dbName && formik.errors.dbName && <p className="mt-1 text-xs text-red-500">{formik.errors.dbName}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="dbUsername" className="block text-sm font-medium text-text-primary">Username</label>
                <input
                  type="text"
                  id="dbUsername"
                  {...formik.getFieldProps('dbUsername')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.dbUsername && formik.errors.dbUsername ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                />
                {formik.touched.dbUsername && formik.errors.dbUsername && <p className="mt-1 text-xs text-red-500">{formik.errors.dbUsername}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="dbPassword" className="block text-sm font-medium text-text-primary">
                  Password {isEditing && <span className="text-text-secondary font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  id="dbPassword"
                  {...formik.getFieldProps('dbPassword')}
                  className={`mt-1 block w-full rounded-lg bg-surface border ${formik.touched.dbPassword && formik.errors.dbPassword ? 'border-red-500' : 'border-border'} px-3 py-2 text-text-primary shadow-sm focus:border-primary-main focus:outline-none focus:ring-1 focus:ring-primary-main sm:text-sm`}
                />
                {formik.touched.dbPassword && formik.errors.dbPassword && <p className="mt-1 text-xs text-red-500">{formik.errors.dbPassword}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-surface py-2 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text-primary hover:bg-surface-secondary focus:outline-none focus:ring-1 focus:ring-primary-main mr-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-main disabled:opacity-70"
        >
          {formik.isSubmitting ? 'Saving...' : 'Save Data Source'}
        </button>
      </div>
    </form>
  );
}
