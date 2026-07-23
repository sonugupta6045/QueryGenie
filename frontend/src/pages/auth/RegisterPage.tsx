import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { Database } from 'lucide-react';
import ErrorBanner from '../../components/common/ErrorBanner';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [apiError, setApiError] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const { confirmPassword, ...registerData } = values;
        const payload = { ...registerData, role: 'SUPER_ADMIN' as const };
        const data = await authApi.register(payload);
        dispatch(setCredentials({
          user: { id: data.userId, name: data.name, email: data.email, role: data.role },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        }));
        navigate('/chat', { replace: true });
      } catch (err: any) {
        setApiError(err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to register' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-main rounded-xl flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-main hover:text-primary-dark">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <ErrorBanner error={apiError} className="mb-4" />

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name"
                type="text"
                {...formik.getFieldProps('name')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${formik.touched.name && formik.errors.name ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main focus:z-10 sm:text-sm`}
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps('email')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main focus:z-10 sm:text-sm`}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps('password')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main focus:z-10 sm:text-sm`}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...formik.getFieldProps('confirmPassword')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main focus:z-10 sm:text-sm`}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</div>
              ) : null}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-70 transition-colors"
            >
              {formik.isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}