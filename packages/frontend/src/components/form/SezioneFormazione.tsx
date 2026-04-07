import { RigaDocumento, StatoDocumento } from './RigaDocumento';

const CORSI = [
  { key: 'rspp', label: 'RSPP (Responsabile Sicurezza)' },
  { key: 'rls', label: 'RLS (Rappresentante Lavoratori)' },
  { key: 'primoSoccorso', label: 'Primo soccorso' },
  { key: 'antincendio', label: 'Antincendio' },
  { key: 'formazioneGenerale', label: 'Formazione generale lavoratori' },
  { key: 'formazioneSpecifica', label: 'Formazione specifica mansione' },
  { key: 'dpi', label: 'Utilizzo DPI' },
  { key: 'corsiSpecialistici', label: 'Corsi specialistici' },
];

interface Props {
  value: Record<string, StatoDocumento>;
  onChange: (v: Record<string, StatoDocumento>) => void;
}

export function SezioneFormazione({ value, onChange }: Props) {
  const update = (key: string, v: StatoDocumento) => onChange({ ...value, [key]: v });

  return (
    <div className="divide-y divide-gray-50">
      {CORSI.map(({ key, label }) => (
        <RigaDocumento
          key={key}
          label={label}
          value={value[key]}
          onChange={(v) => update(key, v)}
          opzioni={[
            { value: 'in_corso', label: 'In corso di validità' },
            { value: 'in_scadenza', label: 'In scadenza' },
            { value: 'scaduto', label: 'Scaduto / Non effettuato' },
          ]}
        />
      ))}
    </div>
  );
}
