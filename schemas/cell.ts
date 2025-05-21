// schemas/cell.ts
import { z } from 'zod';

export const CellSchema = z.union([
  z.string(),
  z.number(),
  z.string().regex(/^=.*/, 'Formula must start with "="'),
]);