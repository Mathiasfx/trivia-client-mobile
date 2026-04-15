import type { ReactNode } from 'react';
import type {
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface ButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  soundEnabled?: boolean;
}

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  icon: ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  inputStyle?: StyleProp<ViewStyle>;
}
