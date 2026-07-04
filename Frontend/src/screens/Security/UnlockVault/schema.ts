import { object, string, regex, length, InferInput } from 'valibot';

export const unlockVaultSchema = object({
  pin: string([
    length(4, 'Le code PIN doit contenir exactement 4 chiffres.'),
    regex(/^\d+$/, 'Le code PIN ne doit contenir que des chiffres.')
  ])
});

export type UnlockVaultFormType = InferInput<typeof unlockVaultSchema>;
