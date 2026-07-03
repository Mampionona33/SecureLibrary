import { object, InferInput } from 'valibot';
import { commonValidations } from '@utils/validationPrimitives';

// On construit le schéma d'authentification comme un Lego
export const loginSchema = object({
  email: commonValidations.email,
  password: commonValidations.password,
});

// On exporte automatiquement le type pour TypeScript
export type LoginFormType = InferInput<typeof loginSchema>;
