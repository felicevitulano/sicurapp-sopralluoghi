import clsx from 'clsx';

export interface StatoDocumento {
  stato: string;
  dataScadenza?: string;
  note?: string;
}

interface Opzione {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value?: StatoDocumento;
  onChange: (v: StatoDocumento) => void;
  opzioni: Opzione[];
  showScadenza?: boolean;
}

const colorMap: Record<string, string> = {
  presente: 'border-green-500 bg-green-50 text-green-700',
  valida: 'border-green-500 bg-green-50 text-green-700',
  in_corso: 'border-green-500 bg-green-50 text-green-700',
  mancante: 'border-red-500 bg-red-50 text-red-700',
  scaduto: 'border-red-500 bg-red-50 text-red-700',
  da_aggiornare: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  non_prevista: 'border-gray-400 bg-gray-50 text-gray-600',
  in_scadenza: 'border-orange-500 bg-orange-50 text-orange-700',
};

export function RigaDocumento({ label, value, onChange, opzioni, showScadenza = true }: Props) {
  const stato = value?.stato || '';

  return (
    <div className="px-4 py-3">
      <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {opzioni.map((op) => (
          <button
            key={op.value}
            type="button"
            onClick={() => onChange({ ...value, stato: op.value })}
            className={clsx(
              'px-2.5 py-1 text-xs font-medium rounded border transition-all',
              stato === op.value
                ? colorMap[op.value] || 'border-brand bg-brand-light text-brand'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            )}
          >
            {op.label}
          </button>
        ))}
      </div>
      {stato && stato !== 'non_prevista' && (
        <div className="flex gap-2 flex-wrap">
          {showScadenza && (
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-500">Scadenza</label>
              <input
                type="date"
                value={value?.dataScadenza || ''}
                onChange={(e) => onChange({ ...value!, dataScadenza: e.target.value })}
                className="input text-xs py-1 mt-0.5"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <label className="text-xs text-gray-500">Note</label>
            <input
              type="text"
              value={value?.note || ''}
              onChange={(e) => onChange({ ...value!, note: e.target.value })}
              placeholder="Note aggiuntive..."
              className="input text-xs py-1 mt-0.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
