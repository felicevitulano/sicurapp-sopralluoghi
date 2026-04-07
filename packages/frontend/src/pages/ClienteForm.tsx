import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../services/api';

interface ClienteFormData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  citta: string;
  provincia: string;
  cap: string;
  referente: string;
  telefono: string;
  email: string;
  note: string;
}

export function ClienteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClienteFormData>({
    defaultValues: {
      ragioneSociale: '',
      partitaIva: '',
      codiceFiscale: '',
      indirizzo: '',
      citta: '',
      provincia: '',
      cap: '',
      referente: '',
      telefono: '',
      email: '',
      note: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/clienti/${id}`).then((r) => {
        const c = r.data;
        reset({
          ragioneSociale: c.ragioneSociale || '',
          partitaIva: c.partitaIva || '',
          codiceFiscale: c.codiceFiscale || '',
          indirizzo: c.indirizzo || '',
          citta: c.citta || '',
          provincia: c.provincia || '',
          cap: c.cap || '',
          referente: c.referente || '',
          telefono: c.telefono || '',
          email: c.email || '',
          note: c.note || '',
        });
      }).catch(() => navigate('/clienti'));
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: ClienteFormData) => {
    setSaving(true);
    try {
      const payload = {
        ragioneSociale: data.ragioneSociale,
        partitaIva: data.partitaIva || undefined,
        codiceFiscale: data.codiceFiscale || undefined,
        indirizzo: data.indirizzo || undefined,
        citta: data.citta || undefined,
        provincia: data.provincia || undefined,
        cap: data.cap || undefined,
        referente: data.referente || undefined,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        note: data.note || undefined,
      };
      if (isEdit) {
        await api.put(`/clienti/${id}`, payload);
        navigate(`/clienti/${id}`);
      } else {
        const res = await api.post('/clienti', payload);
        navigate(`/clienti/${res.data.id}`);
      }
    } catch {
      alert('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Modifica cliente' : 'Nuovo cliente'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Dati aziendali</h2>

          <div>
            <label className="label">Ragione sociale *</label>
            <input
              type="text"
              {...register('ragioneSociale', { required: 'Campo obbligatorio' })}
              placeholder="Es. Rossi S.r.l."
              className="input"
            />
            {errors.ragioneSociale && <p className="text-xs text-red-600 mt-1">{errors.ragioneSociale.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Partita IVA</label>
              <input type="text" {...register('partitaIva')} placeholder="12345678901" className="input" />
            </div>
            <div>
              <label className="label">Codice fiscale</label>
              <input type="text" {...register('codiceFiscale')} placeholder="Codice fiscale" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Sede</h2>

          <div>
            <label className="label">Indirizzo</label>
            <input type="text" {...register('indirizzo')} placeholder="Via Roma, 1" className="input" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="label">Città</label>
              <input type="text" {...register('citta')} placeholder="Milano" className="input" />
            </div>
            <div>
              <label className="label">Prov.</label>
              <input type="text" {...register('provincia')} placeholder="MI" maxLength={2} className="input uppercase" />
            </div>
          </div>

          <div className="w-1/3">
            <label className="label">CAP</label>
            <input type="text" {...register('cap')} placeholder="20100" maxLength={5} className="input" />
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Contatti</h2>

          <div>
            <label className="label">Referente</label>
            <input type="text" {...register('referente')} placeholder="Nome e cognome" className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefono</label>
              <input type="tel" {...register('telefono')} placeholder="+39 02 1234567" className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" {...register('email')} placeholder="info@azienda.it" className="input" />
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-2">
          <label className="label">Note</label>
          <textarea
            {...register('note')}
            rows={3}
            placeholder="Note aggiuntive..."
            className="input resize-none"
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-40 md:relative md:border-t-0 md:px-0 md:py-0 md:bg-transparent">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1 md:flex-none"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <Save size={16} /> {saving ? 'Salvando...' : 'Salva cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
