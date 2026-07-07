import * as v from 'valibot';

export const createUserSchema = v.object({
  firstName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, 'Le prénom doit contenir au moins 2 caractères')
  ),
  lastName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, 'Le nom doit contenir au moins 2 caractères')
  ),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email('Veuillez entrer une adresse email valide')
  ),
  password: v.pipe(
    v.string(),
    v.minLength(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    v.regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule'),
    v.regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  ),
  // Utilisation sécurisée du picklist
  role: v.picklist(['admin', 'staff', 'reader'])
});

export type CreateUserData = v.InferOutput<typeof createUserSchema>;
