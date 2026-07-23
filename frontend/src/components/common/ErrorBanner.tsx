import { AlertCircle } from 'lucide-react';
import { ErrorDetails } from '../../types/apiResponse';

interface ErrorBannerProps {
  error: ErrorDetails | null;
  className?: string;
}

const friendlyMessages: Record<string, string> = {
  UNSAFE_SQL_REJECTED: "That question couldn't be safely converted to a query. Try rephrasing.",
  LLM_UNAVAILABLE: "The AI service is temporarily unavailable — please try again shortly.",
  DATASOURCE_UNREACHABLE: "Couldn't reach the connected database. An admin has been notified.",
  RATE_LIMIT_EXCEEDED: "Too many requests — please wait a moment.",
  VALIDATION_FAILED: "Please check the highlighted fields.",
};

export default function ErrorBanner({ error, className = '' }: ErrorBannerProps) {
  if (!error) return null;

  const friendlyMessage = friendlyMessages[error.code] || 'Something went wrong. Please try again.';

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{friendlyMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
