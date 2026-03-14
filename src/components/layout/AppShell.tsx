import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar, MobileNav } from './Sidebar';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export function AppShell() {
  useRealtimeSync();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('shiftsync-location');
    } catch {
      return null;
    }
  });

  const handleLocationChange = useCallback((id: string) => {
    setSelectedLocationId(id);
    try {
      localStorage.setItem('shiftsync-location', id);
    } catch { /* noop */ }
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header
        selectedLocationId={selectedLocationId}
        onLocationChange={handleLocationChange}
      />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet context={{ selectedLocationId, onLocationChange: handleLocationChange }} />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
