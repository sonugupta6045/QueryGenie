import { useTopQuestions } from '../../hooks/useUsageAnalytics';
import { MessageSquare } from 'lucide-react';
import PageSpinner from '../common/PageSpinner';
import ErrorBanner from '../common/ErrorBanner';

export default function TopQuestionsTable() {
  const { data: questions, isLoading, error } = useTopQuestions();

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorBanner error={(error as any)?.response?.data?.error} />;
  
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-secondary bg-surface-secondary rounded-lg border border-dashed border-border mt-4">
        No questions have been asked yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden shadow-sm border border-border md:rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-secondary">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text-primary sm:pl-6">
              Question
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-text-primary">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {questions.map((item, index) => (
            <tr key={index} className="hover:bg-surface-secondary/50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-text-primary sm:pl-6 flex items-center">
                <MessageSquare size={16} className="text-text-secondary mr-2" />
                {item.question}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-text-secondary text-right font-medium">
                {item.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
