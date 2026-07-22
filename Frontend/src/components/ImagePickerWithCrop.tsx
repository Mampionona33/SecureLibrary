import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

interface ImagePickerWithCropProps {
  onImageSelected: (uri: string, name: string) => void;
  aspectRatio?: { width: number; height: number };
  label?: string;
}

export const ImagePickerWithCrop: React.FC<ImagePickerWithCropProps> = ({
  onImageSelected,
  aspectRatio = { width: 1, height: 1.4 }, // Standard book cover ratio
  label = 'Choisir une image'
}) => {
  const pickImage = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: aspectRatio.width * 400,
        height: aspectRatio.height * 400,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        compressImageMaxWidth: 800,
        compressImageMaxHeight: 1120,
        includeBase64: false,
        mediaType: 'photo',
      });

      onImageSelected(image.path, image.filename || 'cover.jpg');
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.placeholder}>
        <Text>📷 Tap to select and crop</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  placeholder: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
