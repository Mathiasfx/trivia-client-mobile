import React, { ReactNode } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  icon: ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  inputStyle?: StyleProp<ViewStyle>;
}

export const InputField = ({
  icon,
  value,
  onChangeText,
  placeholder,
  inputStyle,
  ...props
}: InputFieldProps) => {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputRow}>
        {icon}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    backgroundColor: 'transparent',
  },
});
