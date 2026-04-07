import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SyncStatus } from '../ui/SyncStatus';

export function Layout() {
  return (
    <div className="flex h-screen bg-neutral-bg overflow-hidden">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <SyncStatus />
      </div>
    </div>
  );
}
