import * as v from 'valibot';

export const createBookSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'Le titre est requis')),
  author: v.pipe(v.string(), v.minLength(1, "L'auteur est requis")),
  category: v.optional(v.nullable(v.string())),
  year: v.optional(v.nullable(v.pipe(v.number(), v.integer()))),
  isbn: v.optional(v.nullable(v.string())),
  description: v.optional(v.nullable(v.string())),
  status: v.optional(v.union([
    v.literal('active'),
    v.literal('archived'),
  ]), 'active'),  // ✅ Valeur par défaut 'active'
});

export type CreateBookFormType = v.InferOutput<typeof createBookSchema>;
