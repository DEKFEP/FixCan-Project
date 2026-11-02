import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { analyzeResponseSchema, scanAnalysisSchema } from '@/ai/schema';
import { DEMO_MODEL, getMockAnalysis } from '@/data/mockScans';
import type { Locale, ScanAnalysis } from '@/types/scan';

export interface AnalysisResult {
  analysis: ScanAnalysis;
  model: string;
}

const AI_MODE = process.env.EXPO_PUBLIC_AI_MODE ?? 'mock';
const PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeLive(uri: string, locale: Locale, url: string): Promise<AnalysisResult> {
  const file = new File(uri);
  const imageBase64 = await file.base64();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType: file.type || 'image/jpeg',
        locale,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI proxy responded with ${response.status}`);
    }

    const payload = await response.json();
    const parsed = analyzeResponseSchema.parse(payload);
    return {
      analysis: parsed.analysis,
      model: parsed.model ?? 'llama-4-maverick',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeImage(uri: string, locale: Locale): Promise<AnalysisResult> {
  if (AI_MODE === 'live' && PROXY_URL && Platform.OS !== 'web') {
    try {
      return await analyzeLive(uri, locale, PROXY_URL);
    } catch (error) {
      console.warn('Live analysis failed, falling back to demo data.', error);
    }
  }

  await delay(2300);
  return {
    analysis: getMockAnalysis(locale),
    model: DEMO_MODEL,
  };
}

export { scanAnalysisSchema };
