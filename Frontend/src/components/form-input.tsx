import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Controller, Control, FieldValues, FieldPath } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: FieldPath<T>;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  icon,
  isPassword = false,
  multiline = false,
  ...rest
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View
            style={[
              styles.inputWrapper,
              multiline && styles.multilineWrapper,
              error && styles.inputError,
            ]}
          >
            {icon && <View style={styles.icon}>{icon}</View>}

            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              value={value?.toString() ?? ""}
              onChangeText={onChange}
              placeholderTextColor="#999"
              secureTextEntry={isPassword && !showPassword}
              multiline={multiline}
              {...rest}
            />

            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff color="#5A5A40" size={20} />
                ) : (
                  <Eye color="#5A5A40" size={20} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E5F0",
  },

  multilineWrapper: {
    alignItems: "flex-start",
    paddingTop: 10,
  },

  inputError: {
    borderColor: "#FF4D4F",
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1E2432",
  },

  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },

  eyeButton: {
    paddingLeft: 8,
  },

  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
