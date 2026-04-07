import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import { SezioneDocumentazione } from '../components/form/SezioneDocumentazione';
import { SezioneAutorizzazioni } from '../components/form/SezioneAutorizzazioni';
import { SezioneSorveglianza } from '../components/form/SezioneSorveglianza';
import { SezioneFormazione } from '../components/form/SezioneFormazione';
import { SezioneRequisiti } from '../components/form/SezioneRequisiti';
import { ClienteSelect } from '../components/form/ClienteSelect';

export function SopralluogoForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('base');
  const [sezioni, setSezioni] = useState({
    documentazione: {} as any,
    autorizzazioni: {} as any,
    sorveglianzaSanitaria: {} as any,
    formazione: {} as any,
    requisitiStrutturali: {} as any,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      clienteId: searchParams.get('clienteId') || '',
      tipo: 'PERIODICO',
      dataSopralluogo: new Date().toISOString().split('T')[0],
      tecnico: '',
      note: '',
      stato: 'BOZZA',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/sopralluoghi/${id}`).then((r) => {
        const s = r.data;
        setValue('clienteId', s.clienteId);
        setValue('tipo', s.tipo);
        setValue('dataSopralluogo', s.dataSopralluogo.split('T')[0]);
        setValue('tecnico', s.tecnico || '');
        setValue('note', s.note || '');
        setValue('stato', s.stato);
        setSezioni({
          documentazione: s.documentazione || {},
          autorizzazioni: s.autorizzazioni || {},
          sorveglianzaSanitaria: s.sorveglianzaSanitaria || {},
          formazione: s.formazione || {},
          requisitiStrutturali: s.requisitiStrutturali || {},
        });
      });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        dataSopralluogo: new Date(data.dataSopralluogo).toISOString(),
        ...sezioni,
      };
      if (isEdit) {
        await api.put(`/sopralluoghi/${id}`, payload);
        navigate(`/sopralluoghi/${id}`);
      } else {
        const res = await api.post('/sopralluoghi', payload);
        navigate(`/sopralluoghi/${res.data.id}`);
      }
    } catch (err) {
      alert('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (data: any) => {
    setValue('stato', 'COMPLETATO');
    await onSubmit({ ...data, stato: 'COMPLETATO' });
  };


  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Modifica sopralluogo' : 'Nuovo sopralluogo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        {/* Sezione base */}
        <SectionWrapper
          id="base"
          label="Dati generali"
          active={activeSection}
          onToggle={setActiveSection}
        >
          <div className="p-4 space-y-4">
            <div>
              <label className="label">Cliente *</label>
              <ClienteSelect
                value={watch('clienteId')}
                onChange={(v) => setValue('clienteId', v)}
              />
              {errors.clienteId && <p className="text-xs text-red-600 mt-1">Seleziona un cliente</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo sopralluogo *</label>
                <select {...register('tipo')} className="input">
                  <option value="PRIMO">Primo sopralluogo</option>
                  <option value="PERIODICO">Periodico</option>
                </select>
              </div>
              <div>
                <label className="label">Data *</label>
                <input type="date" {...register('dataSopralluogo', { required: true })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Tecnico</label>
              <input type="text" {...register('tecnico')} placeholder="Nome del tecnico" className="input" />
            </div>
          </div>
        </SectionWrapper>

        {/* Documentazione */}
        <SectionWrapper id="documentazione" label="1. Documentazione" active={activeSection} onToggle={setActiveSection}>
          <SezioneDocumentazione
            value={sezioni.documentazione}
            onChange={(v) => setSezioni((prev) => ({ ...prev, documentazione: v }))}
          />
        </SectionWrapper>

        {/* Autorizzazioni */}
        <SectionWrapper id="autorizzazioni" label="2. Autorizzazioni" active={activeSection} onToggle={setActiveSection}>
          <SezioneAutorizzazioni
            value={sezioni.autorizzazioni}
            onChange={(v) => setSezioni((prev) => ({ ...prev, autorizzazioni: v }))}
          />
        </SectionWrapper>

        {/* Sorveglianza */}
        <SectionWrapper id="sorveglianza" label="3. Sorveglianza Sanitaria" active={activeSection} onToggle={setActiveSection}>
          <SezioneSorveglianza
            value={sezioni.sorveglianzaSanitaria}
            onChange={(v) => setSezioni((prev) => ({ ...prev, sorveglianzaSanitaria: v }))}
          />
        </SectionWrapper>

        {/* Formazione */}
        <SectionWrapper id="formazione" label="4. Formazione" active={activeSection} onToggle={setActiveSection}>
          <SezioneFormazione
            value={sezioni.formazione}
            onChange={(v) => setSezioni((prev) => ({ ...prev, formazione: v }))}
          />
        </SectionWrapper>

        {/* Requisiti Strutturali */}
        <SectionWrapper id="requisiti" label="5. Requisiti Strutturali" active={activeSection} onToggle={setActiveSection}>
          <SezioneRequisiti
            value={sezioni.requisitiStrutturali}
            onChange={(v) => setSezioni((prev) => ({ ...prev, requisitiStrutturali: v }))}
          />
        </SectionWrapper>

        {/* Note */}
        <SectionWrapper id="note" label="Note generali" active={activeSection} onToggle={setActiveSection}>
          <div className="p-4">
            <textarea
              {...register('note')}
              rows={5}
              placeholder="Note libere, osservazioni generali..."
              className="input resize-none"
            />
          </div>
        </SectionWrapper>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-40 md:relative md:border-t-0 md:px-0 md:py-0 md:bg-transparent">
          <button type="submit" disabled={saving} className="btn-secondary flex items-center gap-2 flex-1 md:flex-none justify-center">
            <Save size={16} /> {saving ? 'Salvando...' : 'Salva bozza'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit(handleComplete)}
            className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <CheckCircle size={16} /> Completa sopralluogo
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionWrapper({ id, label, active, onToggle, children }: {
  id: string; label: string; active: string; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = active === id;
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(isOpen ? '' : id)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand text-white hover:bg-brand-dark transition-colors"
      >
        <span className="font-semibold text-sm tracking-wide">{label}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && children}
    </div>
  );
}
