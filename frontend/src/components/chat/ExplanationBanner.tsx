import { Info } from 'lucide-react';

interface ExplanationBannerProps {
  explanation: string;
}

export default function ExplanationBanner({ explanation }: ExplanationBannerProps) {
  if (!explanation) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
