import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex items-center space-x-3 text-primary-main p-4 bg-primary-main/5 rounded-lg border border-primary-main/10 animate-pulse w-fit">
      <Loader2 className="animate-spin h-5 w-5" />
      <span className="font-medium text-sm">AI is thinking...</span>
    </div>
  );
}
