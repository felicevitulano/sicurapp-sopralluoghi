import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { prisma } from '../utils/db';
import { transcribeAudio } from '../services/transcription';

export const mediaRouter = Router();

const MEDIA_DIR = process.env.MEDIA_DIR || path.join(__dirname, '..', '..', 'media');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const dir = path.join(MEDIA_DIR, 'tmp');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/sopralluoghi/:id/media
mediaRouter.post('/:id/media', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File non fornito' });
  }

  const sopralluogoId = req.params.id as string;
  const didascalia = Array.isArray(req.body.didascalia) ? req.body.didascalia[0] : req.body.didascalia as string | undefined;
  const sezione = Array.isArray(req.body.sezione) ? req.body.sezione[0] : req.body.sezione as string | undefined;
  const campo = Array.isArray(req.body.campo) ? req.body.campo[0] : req.body.campo as string | undefined;
  const isAudio = req.file.mimetype.startsWith('audio/');

  // Move file to organized directory
  const dir = path.join(MEDIA_DIR, sopralluogoId);
  await fs.mkdir(dir, { recursive: true });
  const destPath = path.join(dir, req.file.filename);
  await fs.rename(req.file.path, destPath);

  let trascrizione: string | undefined;
  if (isAudio) {
    trascrizione = await transcribeAudio(destPath).catch(() => undefined);
  }

  const mediaFile = await prisma.mediaFile.create({
    data: {
      sopralluogoId,
      tipo: isAudio ? 'AUDIO' : 'FOTO',
      filename: req.file.filename,
      path: `/media/${sopralluogoId}/${req.file.filename}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      didascalia: didascalia || undefined,
      trascrizione,
      sezione: sezione || undefined,
      campo: campo || undefined,
    },
  });

  res.status(201).json(mediaFile);
});

// DELETE /api/sopralluoghi/:id/media/:mediaId
mediaRouter.delete('/:id/media/:mediaId', async (req, res) => {
  const media = await prisma.mediaFile.findUniqueOrThrow({
    where: { id: req.params.mediaId, sopralluogoId: req.params.id },
  });

  const filePath = path.join(MEDIA_DIR, media.sopralluogoId, media.filename);
  await fs.unlink(filePath).catch(() => {});
  await prisma.mediaFile.delete({ where: { id: media.id } });

  res.status(204).send();
});
