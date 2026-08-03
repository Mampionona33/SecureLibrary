import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { pick } from '@react-native-documents/picker';
import RNBlobUtil from 'react-native-blob-util';
import ImagePicker from 'react-native-image-crop-picker';

type FileType = 'pdf' | 'image' | 'all';

interface FilePickerProps {
  onFileSelected: (
    file: { uri: string; name: string; type?: string } | null,
  ) => void;
  selectedFile: { uri: string; name: string; type?: string } | null;
  label: string;
  placeholder: string;
  testID?: string;
  type?: FileType;
  onBeforeOpen?: () => void; // Pour fermer les modales avant d'ouvrir
  cropEnabled?: boolean;
  cropAspect?: { width: number; height: number };
  cropQuality?: number;
}

const FilePickerComponent: React.FC<FilePickerProps> = ({
  onFileSelected,
  selectedFile,
  label = 'Fichier PDF',
  placeholder = 'Choisir un fichier PDF',
  testID = 'file-picker',
  type = 'all',
  onBeforeOpen,
  cropEnabled = true,
  cropAspect = { width: 1, height: 1.4 },
  cropQuality = 0.9,
}) => {
  const pickFile = async () => {
    // Fermer les modales avant d'ouvrir
    if (onBeforeOpen) {
      onBeforeOpen();
    }

    // Attendre que la modale soit fermée
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // --- CAS PDF ---
      if (type === 'pdf') {
        const [result] = await pick({
          mode: 'import',
          type: 'application/pdf',
        });

        if (result) {
          const fileName = result.name || 'document.pdf';
          const destPath = `${
            RNBlobUtil.fs.dirs.CacheDir
          }/${Date.now()}_${fileName}`;
          await RNBlobUtil.fs.cp(result.uri, destPath);
          onFileSelected({
            uri: destPath,
            name: fileName,
            type: result.type || undefined,
          });
        }
        return;
      }

      // --- CAS IMAGE avec crop ---
      if (type === 'image' && cropEnabled) {
        const image = await ImagePicker.openPicker({
          width: 800,
          height: 1120,
          cropping: true,
          cropperCircleOverlay: false,
          compressImageQuality: cropQuality,
          compressImageMaxWidth: 800,
          compressImageMaxHeight: 1120,
          includeBase64: false,
          mediaType: 'photo',
          cropperToolbarTitle: 'Recadrer la couverture',
          cropperToolbarColor: '#1e293b',
          cropperStatusBarColor: '#1e293b',
          cropperTintColor: '#3b82f6',
          freeStyleCropEnabled: false,
          // Forcer le ratio
          cropperCropSize: {
            width: cropAspect.width * 300,
            height: cropAspect.height * 300,
          },
        });

        if (image) {
          const fileName = image.filename || 'cover.jpg';
          // Copier l'image recadrée dans le cache pour l'upload
          const destPath = `${
            RNBlobUtil.fs.dirs.CacheDir
          }/${Date.now()}_${fileName}`;
          await RNBlobUtil.fs.cp(image.path, destPath);
          onFileSelected({
            uri: destPath,
            name: fileName,
            type: image.mime || 'image/jpeg',
          });
        }
        return;
      }

      // --- CAS IMAGE sans crop (fallback) ---
      if (type === 'image') {
        const [result] = await pick({
          mode: 'import',
          type: 'image/*',
        });

        if (result) {
          const fileName = result.name || 'image.jpg';
          const destPath = `${
            RNBlobUtil.fs.dirs.CacheDir
          }/${Date.now()}_${fileName}`;
          await RNBlobUtil.fs.cp(result.uri, destPath);
          onFileSelected({
            uri: destPath,
            name: fileName,
            type: result.type || undefined,
          });
        }
        return;
      }

      // --- CAS ALL (autre fichier) ---
      const [result] = await pick({
        mode: 'import',
      });

      if (result) {
        const fileName = result.name || 'file';
        const destPath = `${
          RNBlobUtil.fs.dirs.CacheDir
        }/${Date.now()}_${fileName}`;
        await RNBlobUtil.fs.cp(result.uri, destPath);
        onFileSelected({
          uri: destPath,
          name: fileName,
          type: result.type || undefined,
        });
      }
    } catch (err: any) {
      // Gérer les annulations
      if (err?.code === 'CANCELED' || err?.code === 'E_PICKER_CANCELLED') {
        console.log('Sélection annulée');
      } else {
        console.log('Erreur:', err);
        Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
      }
    }
  };

  const removeFile = async () => {
    if (selectedFile?.uri) {
      try {
        await RNBlobUtil.fs.unlink(selectedFile.uri);
      } catch (_) {}
    }
    onFileSelected(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} testID="file-picker-label">
        {label}
      </Text>
      <TouchableOpacity
        testID={testID}
        style={styles.button}
        onPress={pickFile}
      >
        {selectedFile ? (
          <View style={styles.fileInfo}>
            {type === 'image' && (
              <Image
                source={{ uri: selectedFile.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.text} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <TouchableOpacity
              testID="file-picker-clear"
              onPress={removeFile}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.placeholderText} testID="file-picker-placeholder">
            {placeholder}
          </Text>
        )}
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
    minHeight: 50,
  },
  text: { color: '#333', flex: 1 },
  placeholderText: { color: '#999' },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: 40,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FilePickerComponent;
