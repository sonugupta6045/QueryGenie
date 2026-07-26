import { Info } from 'lucide-react';

interface ExplanationBannerProps {
  explanation: string;
}

export default function ExplanationBanner({ explanation }: ExplanationBannerProps) {
  if (!explanation) return null;

  return (
    <div className="bg-primary-subtle border-l-4 border-primary-main p-4 mb-4 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-primary-main" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-text-primary">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
