interface SorveglianzaData {
  totaleAddetti?: number;
  visitati?: number;
  licenziati?: number;
  cambioMansione?: number;
  riunionePeriodica?: boolean;
  verbalePresente?: boolean;
  note?: string;
}

interface Props {
  value: SorveglianzaData;
  onChange: (v: SorveglianzaData) => void;
}

export function SezioneSorveglianza({ value, onChange }: Props) {
  const update = (key: keyof SorveglianzaData, v: any) => onChange({ ...value, [key]: v });

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Totale addetti" value={value.totaleAddetti} onChange={(v) => update('totaleAddetti', v)} />
        <NumInput label="Visitati dal medico" value={value.visitati} onChange={(v) => update('visitati', v)} />
        <NumInput label="Licenziati nel periodo" value={value.licenziati} onChange={(v) => update('licenziati', v)} />
        <NumInput label="Cambio mansione" value={value.cambioMansione} onChange={(v) => update('cambioMansione', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CheckField
          label="Riunione periodica effettuata"
          value={value.riunionePeriodica}
          onChange={(v) => update('riunionePeriodica', v)}
        />
        <CheckField
          label="Verbale medico competente presente"
          value={value.verbalePresente}
          onChange={(v) => update('verbalePresente', v)}
        />
      </div>

      <div>
        <label className="label">Note</label>
        <textarea
          value={value.note || ''}
          onChange={(e) => update('note', e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="Note sulla sorveglianza sanitaria..."
        />
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange }: { label: string; value?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      <input
        type="number"
        min={0}
        value={value ?? ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="input"
      />
    </div>
  );
}

function CheckField({ label, value, onChange }: { label: string; value?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${
            value === true ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          Sì
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${
            value === false ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
