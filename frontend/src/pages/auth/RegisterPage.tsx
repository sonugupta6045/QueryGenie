import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import ErrorBanner from '../../components/common/ErrorBanner';
import AuthCard from '../../components/common/AuthCard';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';

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
        dispatch(
          setCredentials({
            user: { id: data.userId, name: data.name, email: data.email, role: data.role },
            accessToken: data.accessToken,
          })
        );
        navigate('/chat', { replace: true });
      } catch (err: any) {
        setApiError(err.response?.data?.error || { code: 'UNKNOWN', message: 'Failed to register' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthCard>
      <div className="text-center flex flex-col items-center">
        <Logo size="lg" className="mb-2" />
        <h2 className="mt-6 text-3xl font-extrabold text-text-primary tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Or{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-main hover:text-primary-dark transition-colors"
          >
            sign in to existing account
          </Link>
        </p>
      </div>

      <ErrorBanner error={apiError} className="mb-4" />

      <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              {...formik.getFieldProps('name')}
              className={`appearance-none relative block w-full px-4 py-2.5 bg-surface border ${
                formik.touched.name && formik.errors.name ? 'border-rose-500' : 'border-border'
              } placeholder:text-text-secondary text-text-primary rounded-xl focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main sm:text-sm transition-colors`}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-rose-500 text-xs mt-1.5">{formik.errors.name}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...formik.getFieldProps('email')}
              className={`appearance-none relative block w-full px-4 py-2.5 bg-surface border ${
                formik.touched.email && formik.errors.email ? 'border-rose-500' : 'border-border'
              } placeholder:text-text-secondary text-text-primary rounded-xl focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main sm:text-sm transition-colors`}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-rose-500 text-xs mt-1.5">{formik.errors.email}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              className={`appearance-none relative block w-full px-4 py-2.5 bg-surface border ${
                formik.touched.password && formik.errors.password
                  ? 'border-rose-500'
                  : 'border-border'
              } placeholder:text-text-secondary text-text-primary rounded-xl focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main sm:text-sm transition-colors`}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-rose-500 text-xs mt-1.5">{formik.errors.password}</div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...formik.getFieldProps('confirmPassword')}
              className={`appearance-none relative block w-full px-4 py-2.5 bg-surface border ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-rose-500'
                  : 'border-border'
              } placeholder:text-text-secondary text-text-primary rounded-xl focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main sm:text-sm transition-colors`}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-rose-500 text-xs mt-1.5">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}