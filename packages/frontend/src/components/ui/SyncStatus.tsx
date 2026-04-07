import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

type SyncState = 'online' | 'offline' | 'syncing' | 'synced';

export function SyncStatus() {
  const [state, setState] = useState<SyncState>(navigator.onLine ? 'online' : 'offline');

  useEffect(() => {
    const handleOnline = () => setState('online');
    const handleOffline = () => setState('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (state === 'online') return null;

  return (
    <div
      className={clsx(
        'fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 transition-all',
        {
          'bg-red-600 text-white': state === 'offline',
          'bg-blue-600 text-white': state === 'syncing',
          'bg-green-600 text-white': state === 'synced',
        }
      )}
    >
      {state === 'offline' && <><WifiOff size={15} /> Offline — dati salvati localmente</>}
      {state === 'syncing' && <><RefreshCw size={15} className="animate-spin" /> Sincronizzazione...</>}
      {state === 'synced' && <><CheckCircle size={15} /> Sincronizzato</>}
    </div>
  );
}
