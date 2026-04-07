import cron from 'node-cron';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

const GIORNI_PREAVVISO = 30;

export function startScadenzeJob() {
  // Esegui ogni giorno alle 8:00
  cron.schedule('0 8 * * *', async () => {
    logger.info('Avvio controllo scadenze');
    await checkScadenze();
  });

  // Esegui subito all'avvio in dev
  if (process.env.NODE_ENV === 'development') {
    checkScadenze().catch((err) => logger.error({ err }, 'Errore check scadenze'));
  }
}

async function checkScadenze() {
  const oggi = new Date();
  const limitDate = new Date();
  limitDate.setDate(oggi.getDate() + GIORNI_PREAVVISO);

  const sopralluoghi = await prisma.sopralluogo.findMany({
    where: { stato: 'COMPLETATO' },
    include: { cliente: true },
  });

  let nuoveNotifiche = 0;

  for (const s of sopralluoghi) {
    const doc = s.documentazione as Record<string, any> | null;
    const form = s.formazione as Record<string, any> | null;
    const auth = s.autorizzazioni as Record<string, any> | null;

    const checks = [
      ...(doc ? extractScadenze(doc, 'documento') : []),
      ...(form ? extractScadenze(form, 'corso') : []),
      ...(auth ? extractScadenze(auth, 'autorizzazione') : []),
    ];

    for (const check of checks) {
      if (!check.dataScadenza) continue;
      const scadenza = new Date(check.dataScadenza);
      if (scadenza > oggi && scadenza <= limitDate) {
        const existing = await prisma.notifica.findFirst({
          where: {
            clienteId: s.clienteId,
            sopralluogoId: s.id,
            elemento: check.elemento,
            dataScadenza: scadenza,
          },
        });
        if (!existing) {
          await prisma.notifica.create({
            data: {
              clienteId: s.clienteId,
              sopralluogoId: s.id,
              tipo: tipoNotifica(check.tipo),
              titolo: `${check.tipo} in scadenza`,
              messaggio: `${check.elemento} scade il ${scadenza.toLocaleDateString('it-IT')}`,
              elemento: check.elemento,
              dataScadenza: scadenza,
            },
          });
          nuoveNotifiche++;
        }
      }
    }
  }

  logger.info({ nuoveNotifiche }, 'Check scadenze completato');
}

function extractScadenze(data: Record<string, any>, tipo: string) {
  const results: Array<{ elemento: string; dataScadenza: string | null; tipo: string }> = [];
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.dataScadenza) {
      results.push({ elemento: key, dataScadenza: value.dataScadenza, tipo });
    }
  }
  return results;
}

function tipoNotifica(tipo: string) {
  if (tipo === 'corso') return 'CORSO_IN_SCADENZA' as const;
  if (tipo === 'autorizzazione') return 'AUTORIZZAZIONE_IN_SCADENZA' as const;
  return 'DOCUMENTO_IN_SCADENZA' as const;
}
