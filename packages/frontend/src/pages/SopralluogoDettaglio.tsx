import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, FileDown, Trash2, Camera, Mic } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { api } from '../services/api';

export function SopralluogoDettaglio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [s, setS] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    api.get(`/sopralluoghi/${id}`)
      .then((r) => setS(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Eliminare questo sopralluogo?')) return;
    await api.delete(`/sopralluoghi/${id}`);
    navigate('/sopralluoghi');
  };

  const handlePdf = async () => {
    setGeneratingPdf(true);
    try {
      const res = await api.post(`/sopralluoghi/${id}/report`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sopralluogo_${s.cliente?.ragioneSociale?.replace(/\s+/g, '_')}_${format(new Date(s.dataSopralluogo), 'yyyy-MM-dd')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Errore nella generazione del PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!s) return <div className="text-center py-12 text-gray-500">Sopralluogo non trovato</div>;

  const foto = s.mediaFiles?.filter((m: any) => m.tipo === 'FOTO') ?? [];
  const audio = s.mediaFiles?.filter((m: any) => m.tipo === 'AUDIO') ?? [];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 mt-0.5">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {s.cliente?.ragioneSociale}
          </h1>
          <p className="text-sm text-gray-500">
            {format(new Date(s.dataSopralluogo), 'd MMMM yyyy', { locale: it })}
            {s.tecnico && ` · ${s.tecnico}`}
            {' · '}
            <span className={s.tipo === 'PRIMO' ? 'text-blue-600' : 'text-purple-600'}>
              {s.tipo === 'PRIMO' ? 'Primo sopralluogo' : 'Sopralluogo periodico'}
            </span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/sopralluoghi/${id}/modifica`} className="btn-secondary text-sm flex items-center gap-1.5">
            <Pencil size={14} /> Modifica
          </Link>
          <button onClick={handlePdf} disabled={generatingPdf} className="btn-primary text-sm flex items-center gap-1.5">
            <FileDown size={14} /> {generatingPdf ? 'Generazione...' : 'PDF'}
          </button>
          <button onClick={handleDelete} className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <span className={s.stato === 'BOZZA' ? 'badge-bozza' : 'badge-completato'}>
          {s.stato === 'BOZZA' ? 'Bozza' : 'Completato'}
        </span>
      </div>

      {/* Sezioni */}
      {s.documentazione && <SezioneJson title="1. Documentazione" data={s.documentazione} />}
      {s.autorizzazioni && <SezioneJson title="2. Autorizzazioni" data={s.autorizzazioni} />}
      {s.sorveglianzaSanitaria && <SezioneJson title="3. Sorveglianza Sanitaria" data={s.sorveglianzaSanitaria} />}
      {s.formazione && <SezioneJson title="4. Formazione" data={s.formazione} />}
      {s.requisitiStrutturali && <SezioneJson title="5. Requisiti Strutturali" data={s.requisitiStrutturali} />}

      {s.note && (
        <div className="card">
          <div className="section-header">Note generali</div>
          <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{s.note}</div>
        </div>
      )}

      {/* Foto */}
      {foto.length > 0 && (
        <div className="card">
          <div className="section-header flex items-center gap-2"><Camera size={14} /> Foto ({foto.length})</div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {foto.map((f: any) => (
              <div key={f.id} className="rounded-lg overflow-hidden border border-gray-100">
                <img src={f.path} alt={f.didascalia || 'Foto'} className="w-full h-32 object-cover" />
                {f.didascalia && <p className="text-xs text-gray-500 p-1.5 truncate">{f.didascalia}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio */}
      {audio.length > 0 && (
        <div className="card">
          <div className="section-header flex items-center gap-2"><Mic size={14} /> Note vocali ({audio.length})</div>
          <div className="divide-y divide-gray-50">
            {audio.map((a: any) => (
              <div key={a.id} className="p-4">
                <p className="text-xs text-gray-500 mb-1">{[a.sezione, a.campo].filter(Boolean).join(' › ') || 'Nota vocale'}</p>
                <audio controls src={a.path} className="w-full h-8" />
                {a.trascrizione && (
                  <p className="text-sm text-gray-700 mt-2 italic bg-accent-warm rounded p-2">
                    "{a.trascrizione}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatKey(k: string) {
  return k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
}

function SezioneJson({ title, data }: { title: string; data: any }) {
  if (!data || typeof data !== 'object') return null;
  return (
    <div className="card">
      <div className="section-header">{title}</div>
      <div className="divide-y divide-gray-50">
        {Object.entries(data).map(([key, val]: [string, any]) => (
          <div key={key} className="px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-sm font-medium text-gray-700 w-48 shrink-0">{formatKey(key)}</span>
            <span className="text-sm text-gray-600">
              {val && typeof val === 'object'
                ? Object.entries(val)
                    .map(([k, v]) => `${formatKey(k)}: ${v}`)
                    .join(' · ')
                : String(val ?? '—')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
