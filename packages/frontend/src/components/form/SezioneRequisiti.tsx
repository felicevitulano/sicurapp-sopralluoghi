import clsx from 'clsx';

const REQUISITI = [
  { key: 'serviziIgienici', label: 'Servizi igienici' },
  { key: 'aerazione', label: 'Aerazione / Ventilazione' },
  { key: 'illuminazione', label: 'Illuminazione' },
  { key: 'pavimentazione', label: 'Pavimentazione' },
  { key: 'cartellonistica', label: 'Cartellonistica di sicurezza' },
  { key: 'antincendioEstintori', label: 'Antincendio — Estintori' },
  { key: 'antincendioRilevatori', label: 'Antincendio — Rilevatori' },
  { key: 'primoSoccorsoKit', label: 'Kit primo soccorso' },
  { key: 'vieEsodo', label: 'Vie di esodo / Uscite emergenza' },
];

interface RequisitoData {
  conforme?: boolean;
  interventi?: string;
}

interface Props {
  value: Record<string, RequisitoData>;
  onChange: (v: Record<string, RequisitoData>) => void;
}

export function SezioneRequisiti({ value, onChange }: Props) {
  const update = (key: string, v: RequisitoData) => onChange({ ...value, [key]: v });

  return (
    <div className="divide-y divide-gray-50">
      {REQUISITI.map(({ key, label }) => {
        const r = value[key] || {};
        return (
          <div key={key} className="px-4 py-3">
            <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => update(key, { ...r, conforme: true })}
                className={clsx('px-3 py-1 text-xs rounded border font-medium transition-all', r.conforme === true
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-200 text-gray-600')}
              >
                ✓ Conforme
              </button>
              <button
                type="button"
                onClick={() => update(key, { ...r, conforme: false })}
                className={clsx('px-3 py-1 text-xs rounded border font-medium transition-all', r.conforme === false
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-200 text-gray-600')}
              >
                ✗ Non conforme
              </button>
            </div>
            {r.conforme === false && (
              <input
                type="text"
                value={r.interventi || ''}
                onChange={(e) => update(key, { ...r, interventi: e.target.value })}
                placeholder="Interventi necessari..."
                className="input text-xs py-1"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
