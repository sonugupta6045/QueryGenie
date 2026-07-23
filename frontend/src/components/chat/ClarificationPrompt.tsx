import { HelpCircle } from 'lucide-react';

interface ClarificationPromptProps {
  message: string;
}

export default function ClarificationPrompt({ message }: ClarificationPromptProps) {
  if (!message) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-2">
      <div className="flex">
        <div className="flex-shrink-0">
          <HelpCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Clarification Needed</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
