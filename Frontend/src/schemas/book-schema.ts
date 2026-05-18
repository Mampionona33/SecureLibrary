import { z } from "zod";

// Schéma Zod
export const bookSchema = z.object({
  title: z.string().min(1, "Titre obligatoire"),
  category: z.string().min(1, "Catégorie obligatoire"),
  author: z.string().min(1, "Auteur obligatoire"),
  year: z
    .string()
    .regex(/^\d{4}$/, "Année sur 4 chiffres")
    .refine((val) => {
      const num = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      return num >= 1500 && num <= currentYear;
    }, "Année invalide"),
  pdfPath: z.string().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
});

// Type dérivé automatiquement
export type BookFormData = z.infer<typeof bookSchema>;
