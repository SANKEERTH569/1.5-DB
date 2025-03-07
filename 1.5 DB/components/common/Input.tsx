import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        placeholderTextColor={COLORS.gray}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  input: {
    fontFamily: 'Inter-Regular',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});

export default Input;