import { object, string, email, minLength, pipe, forward, check, InferInput } from 'valibot';

export const registerSchema = pipe(
  object({
    lastName: pipe(
      string(),
      minLength(2, "Le nom doit contenir au moins 2 caractères.")
    ),
    firstName: pipe(
      string(),
      minLength(2, "Le prénom doit contenir au moins 2 caractères.")
    ),
    email: pipe(
      string(),
      minLength(1, "L'email est obligatoire."),
      email("L'adresse email n'est pas valide.") // <-- Pipe garantit le décodage strict
    ),
    password: pipe(
      string(),
      minLength(8, "Le mot de passe doit contenir au moins 8 caractères.")
    ),
    confirmPassword: pipe(
      string(),
      minLength(1, "Veuillez confirmer votre mot de passe.")
    ),
  }),
  // Validation croisée pour vérifier si les deux mots de passe correspondent
  forward(
    check(
      (input) => input.password === input.confirmPassword,
      'Les mots de passe ne correspondent pas.'
    ),
    ['confirmPassword']
  )
);

export type RegisterFormType = InferInput<typeof registerSchema>;
