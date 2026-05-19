import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]*$/,
        "Le prénom ne doit contenir que des lettres",
      )
      .optional(), // ✅ facultatif
    last_name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
        "Le nom ne doit contenir que des lettres",
      ),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Format d'email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
