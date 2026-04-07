import OpenAI from 'openai';
import fs from 'fs';
import { logger } from '../utils/logger';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY non configurata');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    const client = getOpenAI();
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'it',
    });
    return response.text;
  } catch (err) {
    logger.warn({ err, filePath }, 'Trascrizione audio fallita');
    throw err;
  }
}
