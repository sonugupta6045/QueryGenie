import { Clock } from 'lucide-react';

interface IdleTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export default function IdleTimeoutModal({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}: IdleTimeoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface text-text-primary border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-3 text-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Clock size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">You've Been Idle</h2>
            <p className="text-xs text-text-secondary">Your session is about to expire</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          For your security, you will be automatically logged out due to inactivity in{' '}
          <span className="font-extrabold font-mono text-amber-500 text-base">{remainingSeconds}s</span>.
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 py-2.5 px-4 bg-primary-main text-white font-bold text-sm rounded-xl hover:bg-primary-hover shadow-md shadow-primary-main/20 transition-all cursor-pointer"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogoutNow}
            className="py-2.5 px-4 bg-surface-secondary text-text-secondary hover:text-danger font-semibold text-sm rounded-xl border border-border transition-colors cursor-pointer"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
