import { Router } from 'express';
import { prisma } from '../utils/db';

export const notificheRouter = Router();

// GET /api/notifiche
notificheRouter.get('/', async (req, res) => {
  const { letta } = req.query;
  const where: any = {};
  if (letta !== undefined) where.letta = letta === 'true';

  const notifiche = await prisma.notifica.findMany({
    where,
    orderBy: [{ letta: 'asc' }, { dataScadenza: 'asc' }],
    include: {
      cliente: { select: { id: true, ragioneSociale: true } },
    },
    take: 100,
  });

  res.json(notifiche);
});

// PUT /api/notifiche/:id/letta
notificheRouter.put('/:id/letta', async (req, res) => {
  const notifica = await prisma.notifica.update({
    where: { id: req.params.id },
    data: { letta: true },
  });
  res.json(notifica);
});

// PUT /api/notifiche/leggi-tutte
notificheRouter.put('/leggi-tutte', async (_req, res) => {
  await prisma.notifica.updateMany({ data: { letta: true } });
  res.status(204).send();
});
