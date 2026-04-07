import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { api } from '../services/api';
import clsx from 'clsx';

export function SopralluoghiList() {
  const [sopralluoghi, setSopralluoghi] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stato, setStato] = useState('');
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/sopralluoghi', { params: { stato: stato || undefined, tipo: tipo || undefined, limit: 50 } })
      .then((r) => { setSopralluoghi(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [stato, tipo]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sopralluoghi</h1>
        <Link to="/sopralluoghi/nuovo" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuovo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={stato} onChange={(e) => setStato(e.target.value)} className="input w-auto text-sm py-1.5">
          <option value="">Tutti gli stati</option>
          <option value="BOZZA">Bozza</option>
          <option value="COMPLETATO">Completato</option>
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input w-auto text-sm py-1.5">
          <option value="">Tutti i tipi</option>
          <option value="PRIMO">Primo sopralluogo</option>
          <option value="PERIODICO">Periodico</option>
        </select>
      </div>

      <p className="text-xs text-gray-500">{total} sopralluogh{total !== 1 ? 'i' : 'o'}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      ) : sopralluoghi.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nessun sopralluogo trovato</p>
          <Link to="/sopralluoghi/nuovo" className="btn-primary mt-4 inline-block">
            Crea il primo sopralluogo
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {sopralluoghi.map((s) => (
            <Link
              key={s.id}
              to={`/sopralluoghi/${s.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-accent-warm transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{s.cliente?.ragioneSociale}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(s.dataSopralluogo), 'd MMM yyyy', { locale: it })}
                  {s.cliente?.citta && ` · ${s.cliente.citta}`}
                  {s._count?.mediaFiles > 0 && ` · ${s._count.mediaFiles} allegati`}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <span className={s.tipo === 'PRIMO' ? 'badge-primo' : 'badge-periodico'}>
                  {s.tipo === 'PRIMO' ? 'Primo' : 'Periodico'}
                </span>
                <span className={s.stato === 'BOZZA' ? 'badge-bozza' : 'badge-completato'}>
                  {s.stato === 'BOZZA' ? 'Bozza' : 'Completato'}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
