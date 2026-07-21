import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface ImagePickerProps {
  onImageSelected: (image: { uri: string; name: string } | null) => void;
  selectedImage?: { uri: string; name: string } | null;
  label?: string;
  placeholder?: string;
  testID?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  selectedImage = null,
  label = 'Image de couverture',
  placeholder = 'Choisir une image',
  testID = 'image-picker',
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          // L'utilisateur a annulé
        } else if (response.errorMessage) {
          Alert.alert('Erreur', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          onImageSelected({
            uri: asset.uri || '',
            name: asset.fileName || 'cover.jpg',
          });
        }
      }
    );
  };

  const clearImage = () => {
    onImageSelected(null);
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
            styles.imagePickerButton,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.inputBackground,
              flex: 1,
            },
          ]}
          onPress={pickImage}
        >
          {selectedImage ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={{ width: 40, height: 40, borderRadius: 4, marginRight: spacing.sm }}
              />
              <Text style={[styles.imagePickerText, { color: colors.text }]}>
                {selectedImage.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.imagePickerText, { color: colors.textSecondary }]}>
              {placeholder}
            </Text>
          )}
        </TouchableOpacity>
        {selectedImage && (
          <TouchableOpacity
            testID={`${testID}-clear`}
            onPress={clearImage}
            style={{ marginLeft: spacing.sm, padding: spacing.xs }}
          >
            <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ImagePicker;
