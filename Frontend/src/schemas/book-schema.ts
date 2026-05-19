import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  author: z.string().min(1, "L'auteur est requis"),
  year: z
    .string()
    .min(1, "L'année est requise")
    .regex(/^\d{4}$/, "L'année doit être au format YYYY"),
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  isbn: z
    .string()
    .max(13, "L'ISBN ne peut pas dépasser 13 caractères")
    .optional(),
  status: z.enum(["active", "archived"]),
  pdfPath: z.string().min(1, "Veuillez sélectionner un fichier PDF"),
  coverImage: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookSchema>;
