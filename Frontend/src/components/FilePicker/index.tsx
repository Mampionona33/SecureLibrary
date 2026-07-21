import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { pick } from '@react-native-documents/picker';

type FileType = 'pdf' | 'image' | 'all';

interface FilePickerProps {
  onFileSelected: (file: { uri: string; name: string; type?: string } | null) => void;
  selectedFile: { uri: string; name: string; type?: string } | null;
  label: string;
  placeholder: string;
  testID?: string;
  type?: FileType;
}

const FilePickerComponent: React.FC<FilePickerProps> = ({
  onFileSelected,
  selectedFile,
  label,
  placeholder,
  testID = 'file-picker',
  type = 'all',
}) => {
  const pickFile = async () => {
    try {
      // Sélectionner un fichier
      const [result] = await pick({
        mode: 'import',
        // Limiter les types selon le besoin
        ...(type === 'pdf' && { type: 'application/pdf' }),
        ...(type === 'image' && { type: 'image/*' }),
      });

      if (result) {
        onFileSelected({
          uri: result.uri,
          name: result.name || (type === 'pdf' ? 'document.pdf' : 'file.jpg'),
          type: result.type || undefined,
        });
      }
    } catch (err: any) {
      if (err?.code === 'CANCELED') {
        console.log('Sélection annulée');
      } else {
        console.log('Erreur:', err);
        Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        testID={testID}
        style={styles.button}
        onPress={pickFile}
      >
        <Text style={styles.text}>
          {selectedFile ? selectedFile.name : placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#666' },
  button: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  text: { color: '#333' },
});

export default FilePickerComponent;
