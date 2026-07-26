import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DataSourceSelector from './DataSourceSelector';
import SessionExpiredModal from '../auth/SessionExpiredModal';
import ThemeToggle from '../common/ThemeToggle';

export default function AppShell() {
  return (
    <>
      <div className="flex h-screen bg-bg overflow-hidden font-sans transition-colors duration-200">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 transition-colors duration-200">
            <h1 className="text-xl font-semibold text-text-primary hidden sm:block">
              {/* Context-aware title could go here */}
            </h1>
            <div className="flex items-center gap-4">
              <DataSourceSelector />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-bg transition-colors duration-200">
            <div className="mx-auto max-w-7xl h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <SessionExpiredModal />
    </>
  );
}