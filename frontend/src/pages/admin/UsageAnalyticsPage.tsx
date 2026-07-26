import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUsageAnalytics } from '../../hooks/useUsageAnalytics';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import UsageChart from '../../components/admin/UsageChart';
import TopQuestionsTable from '../../components/admin/TopQuestionsTable';

export default function UsageAnalyticsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useUsageAnalytics();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Admin Dashboard
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Usage Analytics</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Monitor system usage and query volume.
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorBanner error={(error as any)?.response?.data?.error} />}

      {isLoading ? (
        <PageSpinner />
      ) : data ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-surface overflow-hidden shadow-sm rounded-xl border border-border p-6 transition-all hover:shadow-md">
              <dt className="text-sm font-semibold text-text-secondary truncate">Total Queries</dt>
              <dd className="mt-2 text-3xl font-extrabold text-text-primary tracking-tight">{data.totalQueries}</dd>
            </div>
            <div className="bg-surface overflow-hidden shadow-sm rounded-xl border border-border p-6 transition-all hover:shadow-md">
              <dt className="text-sm font-semibold text-text-secondary truncate">Success Rate</dt>
              <dd className="mt-2 text-3xl font-extrabold text-success tracking-tight">{(data.successRate ?? 100).toFixed(1)}%</dd>
            </div>
            <div className="bg-surface overflow-hidden shadow-sm rounded-xl border border-border p-6 transition-all hover:shadow-md">
              <dt className="text-sm font-semibold text-text-secondary truncate">Avg Latency</dt>
              <dd className="mt-2 text-3xl font-extrabold text-text-primary tracking-tight">{(data.avgLatencyMs ?? 0).toFixed(0)} ms</dd>
            </div>
          </div>
          
          {/* Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-base font-semibold text-text-primary">Queries by Data Source</h3>
              <UsageChart data={data.byDataSource} />
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
              <h3 className="text-base font-semibold text-text-primary">Most Asked Questions</h3>
              <TopQuestionsTable />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}