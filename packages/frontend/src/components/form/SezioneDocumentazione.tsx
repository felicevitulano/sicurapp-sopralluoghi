import { RigaDocumento, StatoDocumento } from './RigaDocumento';

const DOCUMENTI = [
  { key: 'dvr', label: 'DVR (Documento Valutazione Rischi)' },
  { key: 'procedureAntiCovid', label: 'Procedure anti-COVID' },
  { key: 'duvri', label: 'DUVRI' },
  { key: 'radon', label: 'Valutazione Radon' },
  { key: 'schedeChimiche', label: 'Schede chimiche (SDS)' },
  { key: 'macchinari', label: 'Documentazione macchinari' },
];

interface Props {
  value: Record<string, StatoDocumento>;
  onChange: (v: Record<string, StatoDocumento>) => void;
}

export function SezioneDocumentazione({ value, onChange }: Props) {
  const update = (key: string, v: StatoDocumento) => onChange({ ...value, [key]: v });

  return (
    <div className="divide-y divide-gray-50">
      {DOCUMENTI.map(({ key, label }) => (
        <RigaDocumento
          key={key}
          label={label}
          value={value[key]}
          onChange={(v) => update(key, v)}
          opzioni={[
            { value: 'presente', label: 'Presente' },
            { value: 'mancante', label: 'Mancante' },
            { value: 'da_aggiornare', label: 'Da aggiornare' },
          ]}
        />
      ))}
    </div>
  );
}
