import { object, string, regex, length } from 'valibot';

export const setupVaultSchema = object({
  pin: string([
    length(4, 'Le code PIN doit contenir exactement 4 chiffres.'),
    regex(/^\d+$/, 'Le code PIN ne doit contenir que des chiffres.')
  ]),
  confirmPin: string([
    length(4, 'Le code de confirmation doit contenir 4 chiffres.')
  ]),
});

export type SetupVaultFormType = {
  pin: string;
  confirmPin: string;
};
