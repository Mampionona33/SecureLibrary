import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

type UploadButtonProps = {
  value?: string;
  label: string;
  activeLabel: string;
  Icon: React.ComponentType<{ color?: string; size?: number }>;
  onPress: () => void;
};

export function UploadButton({
  value,
  label,
  activeLabel,
  Icon,
  onPress,
}: UploadButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.uploadButton, value ? styles.uploadActive : undefined]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {value ? (
        <CheckCircle2 color="#FFF" size={20} />
      ) : (
        <Icon color="#2F66DD" size={20} />
      )}

      <Text
        style={[styles.uploadText, value ? styles.uploadTextActive : undefined]}
      >
        {value ? activeLabel : label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FF",
    borderWidth: 1,
    borderColor: "#2F66DD",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
  },

  uploadActive: {
    backgroundColor: "#2F66DD",
    borderStyle: "solid",
  },

  uploadText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#2F66DD",
  },

  uploadTextActive: {
    color: "#FFF",
  },
});
