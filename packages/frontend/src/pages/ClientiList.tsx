import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

export function ClientiList() {
  const [clienti, setClienti] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const debouncedQ = useDebounce(q, 300);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/clienti', { params: { q: debouncedQ || undefined, limit: 50 } })
      .then((r) => { setClienti(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Clienti</h1>
        <Link to="/clienti/nuovo" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuovo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Cerca per nome, P.IVA, referente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input pl-9"
        />
      </div>

      <p className="text-xs text-gray-500">{total} cliente{total !== 1 ? 'i' : ''}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      ) : clienti.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nessun cliente trovato</p>
          <button onClick={() => navigate('/clienti/nuovo')} className="btn-primary mt-4">
            Aggiungi il primo cliente
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {clienti.map((c) => (
            <Link
              key={c.id}
              to={`/clienti/${c.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-accent-warm transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{c.ragioneSociale}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[c.partitaIva ? `P.IVA ${c.partitaIva}` : null, c.citta, c.referente]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {c._count?.sopralluoghi > 0 && (
                  <span className="text-xs text-gray-400">{c._count.sopralluoghi} sopralluoghi</span>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
