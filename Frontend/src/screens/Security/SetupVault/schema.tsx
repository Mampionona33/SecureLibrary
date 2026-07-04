import { object, string, regex, length, pipe, forward, check, InferInput } from 'valibot';

// 1. Définition du schéma de validation de base et des règles
export const setupVaultSchema = pipe(
  object({
    pin: string([
      length(4, 'Le code PIN doit contenir exactement 4 chiffres.'),
      regex(/^\d+$/, 'Le code PIN ne doit contenir que des chiffres.')
    ]),
    confirmPin: string([
      length(4, 'Le code de confirmation doit contenir 4 chiffres.')
    ]),
  }),
  // 2. Validation croisée : On s'assure que le PIN et sa confirmation matchent
  forward(
    check(
      (input) => input.pin === input.confirmPin,
      'Les codes PIN ne correspondent pas.'
    ),
    ['confirmPin'] // L'erreur sera rattachée au champ confirmPin dans React Hook Form
  )
);

// 3. Extraction automatique du type TypeScript
export type SetupVaultFormType = InferInput<typeof setupVaultSchema>;
