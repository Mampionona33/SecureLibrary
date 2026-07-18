import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface FilePickerProps {
  onFileSelected: (file: { uri: string; name: string } | null) => void;
  selectedFile?: { uri: string; name: string } | null;
  label?: string;
  placeholder?: string;
  testID?: string;
}

const FilePicker: React.FC<FilePickerProps> = ({
  onFileSelected,
  selectedFile = null,
  label = 'Fichier PDF',
  placeholder = 'Choisir un fichier PDF',
  testID = 'file-picker',
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        presentationStyle: 'fullScreen',
      });
      onFileSelected({
        uri: result.uri,
        name: result.name || 'document.pdf',
      });
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // L'utilisateur a annulé
      } else {
        Alert.alert('Erreur', 'Impossible de sélectionner le fichier PDF.');
      }
    }
  };

  const clearFile = () => {
    onFileSelected(null);
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          testID={testID}
          style={[
            styles.filePickerButton,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.inputBackground,
              flex: 1,
            },
          ]}
          onPress={pickFile}
        >
          <Text style={[styles.filePickerText, { color: colors.textSecondary }]}>
            {selectedFile ? selectedFile.name : placeholder}
          </Text>
        </TouchableOpacity>
        {selectedFile && (
          <TouchableOpacity
            testID={`${testID}-clear`}
            onPress={clearFile}
            style={{ marginLeft: spacing.sm, padding: spacing.xs }}
          >
            <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FilePicker;
