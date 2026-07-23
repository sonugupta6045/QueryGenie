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
      <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
        No questions have been asked yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Question
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {questions.map((item, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6 flex items-center">
                <MessageSquare size={16} className="text-gray-400 mr-2" />
                {item.question}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                {item.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
