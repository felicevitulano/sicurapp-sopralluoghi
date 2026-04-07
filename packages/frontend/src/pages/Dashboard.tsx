import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, FileCheck, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { api } from '../services/api';
import clsx from 'clsx';

interface DashboardData {
  recenti: any[];
  bozze: number;
  completati: number;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notifiche, setNotifiche] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sopralluoghi/recenti').then((r) => r.data),
      api.get('/notifiche?letta=false').then((r) => r.data),
    ])
      .then(([dash, notif]) => {
        setData(dash);
        setNotifiche(notif.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link to="/sopralluoghi/nuovo" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuovo Sopralluogo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Bozze" value={data?.bozze ?? 0} color="yellow" />
        <StatCard icon={FileCheck} label="Completati" value={data?.completati ?? 0} color="green" />
        <StatCard icon={AlertCircle} label="Notifiche" value={notifiche.length} color="red" />
        <StatCard icon={Users} label="Clienti attivi" value="—" color="brand" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sopralluoghi recenti */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Sopralluoghi recenti</h2>
            <Link to="/sopralluoghi" className="text-xs text-brand hover:underline">Vedi tutti</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recenti?.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">Nessun sopralluogo ancora</p>
            )}
            {data?.recenti?.map((s: any) => (
              <Link
                key={s.id}
                to={`/sopralluoghi/${s.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent-warm transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.cliente?.ragioneSociale}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(s.dataSopralluogo), 'd MMM yyyy', { locale: it })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={s.stato === 'BOZZA' ? 'badge-bozza' : 'badge-completato'}>
                    {s.stato === 'BOZZA' ? 'Bozza' : 'Completato'}
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifiche scadenze */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Scadenze in arrivo</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {notifiche.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">Nessuna scadenza imminente</p>
            )}
            {notifiche.map((n: any) => (
              <div key={n.id} className="px-4 py-3">
                <p className="text-sm font-medium text-gray-800">{n.titolo}</p>
                <p className="text-xs text-gray-500">{n.cliente?.ragioneSociale}</p>
                <p className="text-xs text-red-600 mt-0.5">{n.messaggio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    brand: 'bg-brand-light text-brand',
  };
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={clsx('p-2.5 rounded-lg', colorMap[color])}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
