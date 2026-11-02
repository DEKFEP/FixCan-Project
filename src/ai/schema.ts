import { z } from 'zod';

const severitySchema = z.enum(['none', 'minor', 'moderate', 'severe']);
const repairabilitySchema = z.enum(['yes', 'partial', 'no', 'unknown', 'not_needed']);
const difficultySchema = z.enum(['easy', 'moderate', 'hard', 'professional']);
const categorySchema = z.enum([
  'gpu',
  'cpu',
  'ram',
  'storage',
  'psu',
  'motherboard',
  'cooling',
  'battery',
  'phone_part',
  'laptop_part',
  'other',
]);
const damageTypeSchema = z.enum([
  'corrosion',
  'crack',
  'burn',
  'bent_pin',
  'missing',
  'dust',
  'swelling',
  'wear',
  'scratch',
  'deformation',
  'other',
]);

export const scanAnalysisSchema = z.object({
  component: z.object({
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    category: categorySchema,
    specs: z.array(z.object({ label: z.string(), value: z.string() })),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    identifiers: z
      .object({
        serial: z.string().optional(),
        partNumber: z.string().optional(),
      })
      .optional(),
  }),
  damage: z.object({
    detected: z.boolean(),
    summary: z.string(),
    severity: severitySchema,
    findings: z.array(
      z.object({
        type: damageTypeSchema,
        description: z.string(),
        location: z.string().optional(),
        confidence: z.number().min(0).max(1),
      }),
    ),
  }),
  repair: z.object({
    repairability: repairabilitySchema,
    difficulty: difficultySchema,
    estimatedTime: z.string().optional(),
    estimatedCost: z
      .object({
        min: z.number(),
        max: z.number(),
        currency: z.string(),
      })
      .optional(),
    tools: z.array(z.string()),
    steps: z.array(
      z.object({
        title: z.string(),
        detail: z.string(),
        safety: z.string().optional(),
      }),
    ),
    warnings: z.array(z.string()),
    whenToSeekPro: z.array(z.string()),
  }),
});

export const analyzeResponseSchema = z.object({
  analysis: scanAnalysisSchema,
  model: z.string().optional(),
});
