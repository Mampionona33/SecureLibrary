import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: FieldPath<T>;
  errors: FieldErrors<T>;
  placeholder: string;
  isPassword?: boolean;
}

export const FormInput = <T extends FieldValues>({
  control,
  name,
  errors,
  placeholder,
  isPassword = false,
  ...rest
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name as any];

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View
            style={[
              styles.inputWrapper,
              error ? styles.inputError : styles.inputBorder,
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder={placeholder}
              secureTextEntry={isPassword && !showPassword}
              value={value}
              onChangeText={onChange}
              placeholderTextColor="#999"
              {...rest}
            />
            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#5A5A40" size={20} />
                ) : (
                  <Eye color="#5A5A40" size={20} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {error && <Text style={styles.errorText}>{error.message as string}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputBorder: { borderColor: "#ccc" },
  inputError: { borderColor: "red" },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: { padding: 10 },
  errorText: { color: "red", fontSize: 12, marginTop: 4, marginLeft: 4 },
});
