import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, User, Plus, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { api } from '../services/api';

export function ClienteDettaglio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clienti/${id}`)
      .then((r) => setCliente(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Eliminare ${cliente?.ragioneSociale}? Questa azione è irreversibile.`)) return;
    await api.delete(`/clienti/${id}`);
    navigate('/clienti');
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!cliente) return <div className="text-center py-12 text-gray-500">Cliente non trovato</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{cliente.ragioneSociale}</h1>
          {cliente.partitaIva && <p className="text-sm text-gray-500">P.IVA {cliente.partitaIva}</p>}
        </div>
        <Link to={`/clienti/${id}/modifica`} className="btn-secondary flex items-center gap-1.5 text-sm">
          <Pencil size={14} /> Modifica
        </Link>
        <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 text-sm">
          <Trash2 size={14} /> Elimina
        </button>
      </div>

      {/* Info */}
      <div className="card p-4 grid sm:grid-cols-2 gap-3">
        {cliente.indirizzo && (
          <InfoRow icon={MapPin} label="Indirizzo" value={[cliente.indirizzo, cliente.citta, cliente.provincia, cliente.cap].filter(Boolean).join(', ')} />
        )}
        {cliente.referente && <InfoRow icon={User} label="Referente" value={cliente.referente} />}
        {cliente.telefono && <InfoRow icon={Phone} label="Telefono" value={cliente.telefono} />}
        {cliente.email && <InfoRow icon={Mail} label="Email" value={cliente.email} />}
        {cliente.note && (
          <div className="sm:col-span-2 bg-accent-warm rounded-lg p-3 text-sm text-gray-600">
            {cliente.note}
          </div>
        )}
      </div>

      {/* Sopralluoghi */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Storico sopralluoghi</h2>
          <Link
            to={`/sopralluoghi/nuovo?clienteId=${id}`}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <Plus size={14} /> Nuovo
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {cliente.sopralluoghi?.length === 0 && (
            <p className="px-4 py-8 text-sm text-gray-500 text-center">Nessun sopralluogo ancora</p>
          )}
          {cliente.sopralluoghi?.map((s: any) => (
            <Link
              key={s.id}
              to={`/sopralluoghi/${s.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent-warm"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {s.tipo === 'PRIMO' ? 'Primo sopralluogo' : 'Sopralluogo periodico'}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(s.dataSopralluogo), 'd MMMM yyyy', { locale: it })}
                  {s.tecnico && ` · ${s.tecnico}`}
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
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-brand mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
