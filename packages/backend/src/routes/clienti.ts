import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/db';

export const clientiRouter = Router();

const ClienteSchema = z.object({
  ragioneSociale: z.string().min(1, 'Ragione sociale obbligatoria'),
  partitaIva: z.string().optional(),
  codiceFiscale: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  cap: z.string().optional(),
  referente: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  note: z.string().optional(),
});

// GET /api/clienti
clientiRouter.get('/', async (req, res) => {
  const { q, page = '1', limit = '50' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where = q
    ? {
        OR: [
          { ragioneSociale: { contains: q as string, mode: 'insensitive' as const } },
          { partitaIva: { contains: q as string } },
          { referente: { contains: q as string, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [clienti, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      orderBy: { ragioneSociale: 'asc' },
      include: {
        _count: { select: { sopralluoghi: true } },
      },
    }),
    prisma.cliente.count({ where }),
  ]);

  res.json({ data: clienti, total, page: parseInt(page as string), limit: parseInt(limit as string) });
});

// GET /api/clienti/:id
clientiRouter.get('/:id', async (req, res) => {
  const cliente = await prisma.cliente.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      sopralluoghi: {
        orderBy: { dataSopralluogo: 'desc' },
        take: 10,
        select: {
          id: true,
          tipo: true,
          stato: true,
          dataSopralluogo: true,
          tecnico: true,
          createdAt: true,
        },
      },
    },
  });
  res.json(cliente);
});

// POST /api/clienti
clientiRouter.post('/', async (req, res) => {
  const data = ClienteSchema.parse(req.body);
  const cliente = await prisma.cliente.create({ data });
  res.status(201).json(cliente);
});

// PUT /api/clienti/:id
clientiRouter.put('/:id', async (req, res) => {
  const data = ClienteSchema.parse(req.body);
  const cliente = await prisma.cliente.update({
    where: { id: req.params.id },
    data,
  });
  res.json(cliente);
});

// DELETE /api/clienti/:id
clientiRouter.delete('/:id', async (req, res) => {
  await prisma.cliente.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// GET /api/clienti/:id/sopralluoghi
clientiRouter.get('/:id/sopralluoghi', async (req, res) => {
  const sopralluoghi = await prisma.sopralluogo.findMany({
    where: { clienteId: req.params.id },
    orderBy: { dataSopralluogo: 'desc' },
    include: {
      _count: { select: { mediaFiles: true } },
    },
  });
  res.json(sopralluoghi);
});
