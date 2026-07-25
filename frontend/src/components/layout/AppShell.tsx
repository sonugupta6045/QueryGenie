import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DataSourceSelector from './DataSourceSelector';
import SessionExpiredModal from '../auth/SessionExpiredModal';

export default function AppShell() {
  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              {/* Context-aware title could go here */}
            </h1>
            <div className="flex items-center gap-4">
              <DataSourceSelector />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
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