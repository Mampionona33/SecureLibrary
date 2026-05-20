import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";

interface PasswordInputProps extends TextInputProps {
  control: Control<any>;
  name: string;
  errors: FieldErrors;
  placeholder?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  control,
  name,
  errors,
  placeholder = "Mot de passe",
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              {...rest}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconContainer}
            >
              {showPassword ? (
                <EyeOff color="#5A5A40" size={20} />
              ) : (
                <Eye color="#5A5A40" size={20} />
              )}
            </TouchableOpacity>
          </View>
        )}
      />
      {error && <Text style={styles.errorText}>{error.message as string}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "red" },
  input: { flex: 1, padding: 10, fontSize: 16 },
  iconContainer: { padding: 10 },
  errorText: { color: "red", fontSize: 12, marginTop: 4, marginLeft: 5 },
});
