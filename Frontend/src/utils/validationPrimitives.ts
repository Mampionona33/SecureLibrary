import { pipe, string, minLength, email, nonEmpty } from 'valibot';

export const commonValidations = {
  // Règle standard pour un email
  email: pipe(
    string("L'email doit être du texte"),
    nonEmpty("L'email est requis"),
    email("Le format de l'email est invalide")
  ),
  
  // Règle standard pour un mot de passe
  password: pipe(
    string("Le mot de passe doit être du texte"),
    nonEmpty("Le mot de passe est requis"),
    minLength(6, "Le mot de passe doit contenir au moins 6 caractères")
  )
};
