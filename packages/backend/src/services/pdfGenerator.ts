import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

export interface SopralluogoDati {
  id: string;
  tipo: string;
  stato: string;
  dataSopralluogo: Date;
  tecnico?: string | null;
  note?: string | null;
  documentazione?: any;
  autorizzazioni?: any;
  sorveglianzaSanitaria?: any;
  formazione?: any;
  requisitiStrutturali?: any;
  cliente: {
    ragioneSociale: string;
    indirizzo?: string | null;
    citta?: string | null;
    provincia?: string | null;
    partitaIva?: string | null;
    referente?: string | null;
    telefono?: string | null;
    email?: string | null;
  };
  mediaFiles: Array<{
    id: string;
    tipo: string;
    path: string;
    didascalia?: string | null;
    trascrizione?: string | null;
    sezione?: string | null;
    campo?: string | null;
  }>;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function statoIcon(stato: string): string {
  if (stato === 'presente' || stato === 'valida' || stato === 'in_corso') return '✓';
  if (stato === 'mancante' || stato === 'non_prevista' || stato === 'scaduto') return '✗';
  return '~';
}

function buildHtml(dati: SopralluogoDati): string {
  const foto = dati.mediaFiles.filter((m) => m.tipo === 'FOTO');
  const audio = dati.mediaFiles.filter((m) => m.tipo === 'AUDIO');

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Roboto', Arial, sans-serif; font-size: 10pt; color: #333; }

  .header { background: #18695A; color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 20pt; font-weight: 700; letter-spacing: 1px; }
  .header .subtitle { font-size: 9pt; opacity: 0.9; margin-top: 4px; }
  .header .doc-info { text-align: right; font-size: 9pt; }

  .client-box { background: #EFEBE5; border-left: 4px solid #18695A; padding: 12px 20px; margin: 20px 30px 10px; }
  .client-box h2 { color: #18695A; font-size: 13pt; margin-bottom: 6px; }
  .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9pt; }
  .client-grid span { color: #554431; font-weight: 600; }

  .section { margin: 16px 30px 0; }
  .section-title { background: #18695A; color: white; padding: 6px 12px; font-size: 10pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 0; }
  .section-body { border: 1px solid #ddd; border-top: none; }

  table.data-table { width: 100%; border-collapse: collapse; }
  table.data-table th { background: #eacb9c; color: #333; padding: 5px 10px; font-size: 8.5pt; text-align: left; font-weight: 600; }
  table.data-table td { padding: 5px 10px; font-size: 9pt; border-bottom: 1px solid #eee; vertical-align: top; }
  table.data-table tr:last-child td { border-bottom: none; }
  table.data-table tr:nth-child(even) { background: #fafafa; }

  .stato-presente { color: #18695A; font-weight: 700; }
  .stato-mancante { color: #c0392b; font-weight: 700; }
  .stato-scaduto { color: #e67e22; font-weight: 700; }

  .note-box { background: #FAF8F6; border: 1px solid #ddd; padding: 12px; margin: 16px 30px; font-size: 9pt; }
  .note-box h3 { color: #18695A; margin-bottom: 6px; font-size: 10pt; }

  .media-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
  .media-item { border: 1px solid #ddd; padding: 6px; }
  .media-item img { width: 100%; height: 120px; object-fit: cover; }
  .media-item .caption { font-size: 8pt; color: #666; margin-top: 4px; }

  .audio-item { background: #f5f5f5; padding: 8px; margin: 4px 10px; border-left: 3px solid #554431; }
  .audio-item .trascrizione { font-size: 9pt; font-style: italic; color: #555; }

  .footer { margin-top: 30px; border-top: 2px solid #18695A; padding: 10px 30px; display: flex; justify-content: space-between; font-size: 8pt; color: #777; }

  .firma-box { margin: 20px 30px; border: 1px solid #ddd; padding: 15px; }
  .firma-line { border-bottom: 1px solid #999; margin-top: 30px; width: 200px; display: inline-block; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="header h1">SICUR.A.L.A.</div>
    <div class="subtitle">Sicurezza, Ambiente, Lavoro e Alimentare</div>
    <div class="subtitle" style="margin-top:8px;">Rapporto di Sopralluogo — ${dati.tipo === 'PRIMO' ? 'Primo Sopralluogo' : 'Sopralluogo Periodico'}</div>
  </div>
  <div class="doc-info">
    <div><strong>Data:</strong> ${formatDate(dati.dataSopralluogo)}</div>
    <div><strong>Tecnico:</strong> ${dati.tecnico || '—'}</div>
    <div><strong>Rif.:</strong> ${dati.id.substring(0, 8).toUpperCase()}</div>
  </div>
</div>

<div class="client-box">
  <h2>${dati.cliente.ragioneSociale}</h2>
  <div class="client-grid">
    <div><span>P.IVA:</span> ${dati.cliente.partitaIva || '—'}</div>
    <div><span>Referente:</span> ${dati.cliente.referente || '—'}</div>
    <div><span>Indirizzo:</span> ${[dati.cliente.indirizzo, dati.cliente.citta, dati.cliente.provincia].filter(Boolean).join(', ') || '—'}</div>
    <div><span>Contatti:</span> ${[dati.cliente.telefono, dati.cliente.email].filter(Boolean).join(' | ') || '—'}</div>
  </div>
</div>

${buildDocumentazioneSection(dati.documentazione)}
${buildAutorizzazioniSection(dati.autorizzazioni)}
${buildSorveglianzaSection(dati.sorveglianzaSanitaria)}
${buildFormazioneSection(dati.formazione)}
${buildRequisitiSection(dati.requisitiStrutturali)}

${dati.note ? `
<div class="section">
  <div class="section-title">NOTE GENERALI</div>
  <div class="note-box" style="margin: 0; border-top: none;">
    <p>${dati.note.replace(/\n/g, '<br>')}</p>
  </div>
</div>` : ''}

${foto.length > 0 ? `
<div class="section">
  <div class="section-title">DOCUMENTAZIONE FOTOGRAFICA</div>
  <div class="section-body">
    <div class="media-grid">
      ${foto.map((f) => `
        <div class="media-item">
          <img src="${process.env.BASE_URL || 'http://localhost:3001'}${f.path}" alt="${f.didascalia || 'Foto'}">
          <div class="caption">${[f.sezione, f.campo, f.didascalia].filter(Boolean).join(' — ') || 'Fotografia allegata'}</div>
        </div>
      `).join('')}
    </div>
  </div>
</div>` : ''}

${audio.length > 0 ? `
<div class="section">
  <div class="section-title">NOTE VOCALI TRASCRITTE</div>
  <div class="section-body" style="padding: 8px 0;">
    ${audio.map((a) => `
      <div class="audio-item">
        <strong style="font-size:8.5pt;">${[a.sezione, a.campo].filter(Boolean).join(' › ') || 'Nota vocale'}</strong>
        ${a.trascrizione ? `<div class="trascrizione">"${a.trascrizione}"</div>` : '<div class="trascrizione"><em>Trascrizione non disponibile</em></div>'}
      </div>
    `).join('')}
  </div>
</div>` : ''}

<div class="firma-box">
  <div style="display:flex; justify-content:space-between;">
    <div>
      <div style="font-size:9pt;color:#666;">Firma Tecnico</div>
      <div class="firma-line"></div>
    </div>
    <div>
      <div style="font-size:9pt;color:#666;">Firma Responsabile Azienda</div>
      <div class="firma-line"></div>
    </div>
  </div>
</div>

<div class="footer">
  <span>SICUR.A.L.A. S.r.l. — Documento generato il ${formatDate(new Date())}</span>
  <span>Documento riservato — D.Lgs. 81/2008</span>
</div>

</body>
</html>`;
}

function buildDocumentazioneSection(doc: any): string {
  if (!doc) return '';
  const rows = Object.entries(doc)
    .map(([key, val]: [string, any]) => {
      const stato = val?.stato || '—';
      const cls = stato === 'presente' ? 'stato-presente' : stato === 'mancante' ? 'stato-mancante' : 'stato-scaduto';
      return `<tr>
        <td>${formatLabel(key)}</td>
        <td class="${cls}">${statoIcon(stato)} ${formatStato(stato)}</td>
        <td>${val?.dataScadenza ? formatDate(val.dataScadenza) : '—'}</td>
        <td>${val?.note || '—'}</td>
      </tr>`;
    })
    .join('');

  return `
<div class="section">
  <div class="section-title">1. DOCUMENTAZIONE</div>
  <div class="section-body">
    <table class="data-table">
      <thead><tr><th>Documento</th><th>Stato</th><th>Scadenza</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

function buildAutorizzazioniSection(auth: any): string {
  if (!auth) return '';
  const rows = Object.entries(auth)
    .map(([key, val]: [string, any]) => {
      const stato = val?.stato || '—';
      const cls = stato === 'valida' ? 'stato-presente' : stato === 'non_prevista' ? '' : 'stato-mancante';
      return `<tr>
        <td>${formatLabel(key)}</td>
        <td class="${cls}">${statoIcon(stato)} ${formatStato(stato)}</td>
        <td>${val?.dataScadenza ? formatDate(val.dataScadenza) : '—'}</td>
        <td>${val?.note || '—'}</td>
      </tr>`;
    })
    .join('');

  return `
<div class="section">
  <div class="section-title">2. AUTORIZZAZIONI</div>
  <div class="section-body">
    <table class="data-table">
      <thead><tr><th>Autorizzazione</th><th>Stato</th><th>Scadenza</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

function buildSorveglianzaSection(sor: any): string {
  if (!sor) return '';
  return `
<div class="section">
  <div class="section-title">3. SORVEGLIANZA SANITARIA</div>
  <div class="section-body">
    <table class="data-table">
      <thead><tr><th>Indicatore</th><th>Valore</th></tr></thead>
      <tbody>
        <tr><td>Totale addetti</td><td>${sor.totaleAddetti ?? '—'}</td></tr>
        <tr><td>Visitati dal medico</td><td>${sor.visitati ?? '—'}</td></tr>
        <tr><td>Licenziati nel periodo</td><td>${sor.licenziati ?? '—'}</td></tr>
        <tr><td>Cambio mansione</td><td>${sor.cambioMansione ?? '—'}</td></tr>
        <tr><td>Riunione periodica</td><td>${sor.riunionePeriodica ? 'Effettuata' : 'Non effettuata'}</td></tr>
        <tr><td>Verbale medico competente</td><td>${sor.verbalePresente ? 'Presente' : 'Assente'}</td></tr>
        ${sor.note ? `<tr><td>Note</td><td>${sor.note}</td></tr>` : ''}
      </tbody>
    </table>
  </div>
</div>`;
}

function buildFormazioneSection(form: any): string {
  if (!form) return '';
  const rows = Object.entries(form)
    .map(([key, val]: [string, any]) => {
      const stato = val?.stato || '—';
      const cls = stato === 'in_corso' ? 'stato-presente' : stato === 'in_scadenza' ? 'stato-scaduto' : stato === 'scaduto' ? 'stato-mancante' : '';
      return `<tr>
        <td>${formatLabel(key)}</td>
        <td class="${cls}">${formatStato(stato)}</td>
        <td>${val?.dataScadenza ? formatDate(val.dataScadenza) : '—'}</td>
        <td>${val?.note || '—'}</td>
      </tr>`;
    })
    .join('');

  return `
<div class="section">
  <div class="section-title">4. FORMAZIONE</div>
  <div class="section-body">
    <table class="data-table">
      <thead><tr><th>Corso / Formazione</th><th>Stato</th><th>Scadenza</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

function buildRequisitiSection(req: any): string {
  if (!req) return '';
  const rows = Object.entries(req)
    .map(([key, val]: [string, any]) => {
      const conforme = val?.conforme;
      const cls = conforme === true ? 'stato-presente' : conforme === false ? 'stato-mancante' : '';
      return `<tr>
        <td>${formatLabel(key)}</td>
        <td class="${cls}">${conforme === true ? '✓ Conforme' : conforme === false ? '✗ Non conforme' : '—'}</td>
        <td>${val?.interventi || '—'}</td>
      </tr>`;
    })
    .join('');

  return `
<div class="section">
  <div class="section-title">5. REQUISITI STRUTTURALI</div>
  <div class="section-body">
    <table class="data-table">
      <thead><tr><th>Requisito</th><th>Stato</th><th>Interventi necessari</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatStato(stato: string): string {
  const map: Record<string, string> = {
    presente: 'Presente',
    mancante: 'Mancante',
    da_aggiornare: 'Da aggiornare',
    valida: 'Valida',
    non_prevista: 'Non prevista',
    in_corso: 'In corso di validità',
    in_scadenza: 'In scadenza',
    scaduto: 'Scaduto / Non effettuato',
  };
  return map[stato] || stato;
}

export async function generatePdf(dati: SopralluogoDati): Promise<Buffer> {
  const html = buildHtml(dati);

  logger.info({ sopralluogoId: dati.id }, 'Generazione PDF avviata');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '15mm', left: '10mm' },
      printBackground: true,
    });
    logger.info({ sopralluogoId: dati.id }, 'PDF generato');
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
