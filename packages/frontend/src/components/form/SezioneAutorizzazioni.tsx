import { RigaDocumento, StatoDocumento } from './RigaDocumento';

const AUTORIZZAZIONI = [
  { key: 'cpi', label: 'CPI (Certificato Prevenzione Incendi)' },
  { key: 'aua', label: 'AUA (Autorizzazione Unica Ambientale)' },
  { key: 'privacy', label: 'Privacy / GDPR' },
  { key: 'pis', label: 'PIS (Piano di Intervento in Sicurezza)' },
  { key: 'impiantiElettrici', label: 'Dichiarazione conformità impianti elettrici' },
  { key: 'pianoEvacuazione', label: 'Piano di evacuazione' },
];

interface Props {
  value: Record<string, StatoDocumento>;
  onChange: (v: Record<string, StatoDocumento>) => void;
}

export function SezioneAutorizzazioni({ value, onChange }: Props) {
  const update = (key: string, v: StatoDocumento) => onChange({ ...value, [key]: v });

  return (
    <div className="divide-y divide-gray-50">
      {AUTORIZZAZIONI.map(({ key, label }) => (
        <RigaDocumento
          key={key}
          label={label}
          value={value[key]}
          onChange={(v) => update(key, v)}
          opzioni={[
            { value: 'valida', label: 'Valida' },
            { value: 'non_prevista', label: 'Non prevista' },
            { value: 'da_aggiornare', label: 'Da aggiornare' },
            { value: 'mancante', label: 'Mancante' },
          ]}
        />
      ))}
    </div>
  );
}
