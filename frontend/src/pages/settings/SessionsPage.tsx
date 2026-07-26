import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Laptop, LogOut, Globe, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { sessionApi, UserSession } from '../../api/sessionApi';
import { formatDate } from '../../utils/formatters';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: sessionApi.getSessions,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: sessionApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err?.response?.data?.error?.message || 'Failed to revoke session');
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: sessionApi.revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err?.response?.data?.error?.message || 'Failed to revoke other sessions');
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorBanner error={(error as any)?.response?.data?.error} />;

  const otherSessionsCount = sessions ? sessions.filter((s) => !s.currentSession).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Active Sessions</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your logged-in browser sessions and active devices.
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <button
            onClick={() => revokeOthersMutation.mutate()}
            disabled={revokeOthersMutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-danger bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} className="mr-2" />
            {revokeOthersMutation.isPending ? 'Logging out others...' : 'Log out of all other sessions'}
          </button>
        )}
      </div>

      {actionError && <ErrorBanner error={{ code: 'REVOCATION_FAILED', message: actionError }} />}

      {/* Session Cards */}
      <div className="space-y-4">
        {sessions?.map((session: UserSession) => (
          <div
            key={session.familyId}
            className={`bg-surface p-5 rounded-xl border transition-all ${
              session.currentSession ? 'border-primary-main ring-1 ring-primary-main/20' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-primary-subtle border border-border text-primary-main">
                  <Laptop size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">{session.deviceLabel}</h3>
                    {session.currentSession && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={11} /> This Device
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-text-secondary">
                    {session.ipAddress && (
                      <div className="flex items-center gap-1.5">
                        <Globe size={13} className="text-text-secondary opacity-70" />
                        <span>IP Address: <span className="font-mono text-text-primary">{session.ipAddress}</span></span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-text-secondary opacity-70" />
                      <span>Last active: <span className="font-medium text-text-primary">{formatDate(session.lastUsedAt)}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {!session.currentSession && (
                <button
                  onClick={() => revokeSessionMutation.mutate(session.familyId)}
                  disabled={revokeSessionMutation.isPending}
                  className="px-3 py-1.5 text-xs font-semibold text-danger border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
                  title="Log out this device"
                >
                  <Trash2 size={13} />
                  <span>Log out</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
