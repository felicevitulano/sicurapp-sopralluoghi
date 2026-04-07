import { Router } from 'express';
import { prisma } from '../utils/db';
import { generatePdf } from '../services/pdfGenerator';

export const reportRouter = Router();

// POST /api/sopralluoghi/:id/report
reportRouter.post('/:id/report', async (req, res) => {
  const sopralluogo = await prisma.sopralluogo.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      cliente: true,
      mediaFiles: { orderBy: { createdAt: 'asc' } },
    },
  });

  const pdfBuffer = await generatePdf(sopralluogo as any);

  const filename = `sopralluogo_${sopralluogo.cliente.ragioneSociale.replace(/\s+/g, '_')}_${
    new Date(sopralluogo.dataSopralluogo).toISOString().split('T')[0]
  }.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
});
