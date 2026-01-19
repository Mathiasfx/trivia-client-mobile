import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface LoginFormStyles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  card: ViewStyle;
  title: TextStyle;
  form: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  uppercaseInput: TextStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
  footerText: TextStyle;
}

export const styles = StyleSheet.create<LoginFormStyles>({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...typography.title,
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.text.tertiary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...typography.body,
    backgroundColor: colors.white,
    color: colors.text.primary,
  },
  uppercaseInput: {
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  footerText: {
    ...typography.caption,
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});