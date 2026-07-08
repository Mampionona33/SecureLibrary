import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const useStyles = (theme: any) => {
  const { colors, spacing, radius } = theme;

  return useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.background,
        },
        container: {
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        },
        headerContainer: {
          alignItems: 'center',
          marginBottom: spacing.xl,
        },
        logoIcon: {
          fontSize: 48,
          marginBottom: spacing.xs,
        },
        title: {
          fontSize: 28,
          fontWeight: '600',
          color: colors.text,
        },
        titleHighlight: {
          fontSize: 28,
          fontWeight: '800',
          color: colors.primary,
          marginBottom: spacing.xs,
        },
        subtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
        },
        formContainer: {
          width: '100%',
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.textSecondary,
          marginBottom: spacing.xs,
          marginLeft: 4,
          marginTop: spacing.md,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          height: 50,
        },
        inputErrorBorder: {
          borderColor: colors.danger,
          backgroundColor: colors.danger + '10',
        },
        errorText: {
          color: colors.danger,
          fontSize: 12,
          marginTop: spacing.xs / 2,
          marginLeft: 4,
        },
        input: {
          flex: 1,
          height: '100%',
          color: colors.text,
          fontSize: 16,
        },
        toggleButton: {
          padding: spacing.xs,
        },
        toggleText: {
          color: colors.primary,
          fontSize: 14,
          fontWeight: '600',
        },
        submitButton: {
          backgroundColor: colors.buttonPrimary,
          height: 50,
          borderRadius: radius.md,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.xl,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        },
        submitButtonDisabled: {
          backgroundColor: colors.disabled,
          shadowOpacity: 0,
          elevation: 0,
        },
        submitButtonText: {
          color: colors.buttonPrimaryText,
          fontSize: 16,
          fontWeight: 'bold',
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: spacing.lg,
        },
        footerText: {
          color: colors.textSecondary,
          fontSize: 14,
        },
        footerLink: {
          color: colors.primary,
          fontWeight: 'bold',
          fontSize: 14,
        },
      }),
    [colors, spacing, radius]
  );
};
