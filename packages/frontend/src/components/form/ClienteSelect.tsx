import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function ClienteSelect({ value, onChange }: Props) {
  const [q, setQ] = useState('');
  const [clienti, setClienti] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const debouncedQ = useDebounce(q, 250);

  useEffect(() => {
    if (value && !selected) {
      api.get(`/clienti/${value}`).then((r) => setSelected(r.data)).catch(() => {});
    }
  }, [value, selected]);

  useEffect(() => {
    api.get('/clienti', { params: { q: debouncedQ || undefined, limit: 20 } })
      .then((r) => setClienti(r.data.data))
      .catch(() => {});
  }, [debouncedQ]);

  return (
    <div className="relative">
      {selected ? (
        <div className="input flex items-center justify-between">
          <span className="text-sm">{selected.ragioneSociale}</span>
          <button
            type="button"
            onClick={() => { setSelected(null); onChange(''); setOpen(true); }}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            Cambia
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca cliente..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              className="input pl-8"
            />
          </div>
          {open && clienti.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {clienti.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelected(c); onChange(c.id); setOpen(false); setQ(''); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent-warm flex justify-between"
                >
                  <span>{c.ragioneSociale}</span>
                  {c.partitaIva && <span className="text-gray-400 text-xs">{c.partitaIva}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
