import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/db';

export const sopralluoghiRouter = Router();

const SopralluogoSchema = z.object({
  clienteId: z.string().min(1),
  tipo: z.enum(['PRIMO', 'PERIODICO']),
  stato: z.enum(['BOZZA', 'COMPLETATO']).default('BOZZA'),
  dataSopralluogo: z.string().datetime(),
  tecnico: z.string().optional(),
  note: z.string().optional(),
  documentazione: z.record(z.any()).optional(),
  autorizzazioni: z.record(z.any()).optional(),
  sorveglianzaSanitaria: z.record(z.any()).optional(),
  formazione: z.record(z.any()).optional(),
  requisitiStrutturali: z.record(z.any()).optional(),
});

// GET /api/sopralluoghi
sopralluoghiRouter.get('/', async (req, res) => {
  const { clienteId, stato, tipo, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (clienteId) where.clienteId = clienteId;
  if (stato) where.stato = stato;
  if (tipo) where.tipo = tipo;

  const [sopralluoghi, total] = await Promise.all([
    prisma.sopralluogo.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      orderBy: { dataSopralluogo: 'desc' },
      include: {
        cliente: { select: { id: true, ragioneSociale: true, citta: true } },
        _count: { select: { mediaFiles: true } },
      },
    }),
    prisma.sopralluogo.count({ where }),
  ]);

  res.json({ data: sopralluoghi, total, page: parseInt(page as string), limit: parseInt(limit as string) });
});

// GET /api/sopralluoghi/recenti (per dashboard)
sopralluoghiRouter.get('/recenti', async (_req, res) => {
  const [recenti, bozze, completati] = await Promise.all([
    prisma.sopralluogo.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        cliente: { select: { id: true, ragioneSociale: true } },
      },
    }),
    prisma.sopralluogo.count({ where: { stato: 'BOZZA' } }),
    prisma.sopralluogo.count({ where: { stato: 'COMPLETATO' } }),
  ]);

  res.json({ recenti, bozze, completati });
});

// GET /api/sopralluoghi/:id
sopralluoghiRouter.get('/:id', async (req, res) => {
  const sopralluogo = await prisma.sopralluogo.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      cliente: true,
      mediaFiles: { orderBy: { createdAt: 'asc' } },
    },
  });
  res.json(sopralluogo);
});

// POST /api/sopralluoghi
sopralluoghiRouter.post('/', async (req, res) => {
  const data = SopralluogoSchema.parse(req.body);
  const sopralluogo = await prisma.sopralluogo.create({
    data: {
      ...data,
      dataSopralluogo: new Date(data.dataSopralluogo),
    },
    include: { cliente: { select: { id: true, ragioneSociale: true } } },
  });
  res.status(201).json(sopralluogo);
});

// PUT /api/sopralluoghi/:id
sopralluoghiRouter.put('/:id', async (req, res) => {
  const data = SopralluogoSchema.partial().parse(req.body);
  const updateData: any = { ...data };
  if (data.dataSopralluogo) {
    updateData.dataSopralluogo = new Date(data.dataSopralluogo);
  }
  if (data.stato === 'COMPLETATO') {
    updateData.completedAt = new Date();
  }

  const sopralluogo = await prisma.sopralluogo.update({
    where: { id: req.params.id },
    data: updateData,
    include: { cliente: { select: { id: true, ragioneSociale: true } } },
  });
  res.json(sopralluogo);
});

// DELETE /api/sopralluoghi/:id
sopralluoghiRouter.delete('/:id', async (req, res) => {
  await prisma.sopralluogo.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
