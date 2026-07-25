import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { styles } from './styles';

interface AdminBookCardProps {
  book: any;
  onPress: (bookId: string) => void;
  onArchive?: (bookId: string, currentStatus: string) => void;
  onDelete?: (bookId: string, title: string) => void;
}

const AdminBookCard: React.FC<AdminBookCardProps> = ({
  book,
  onPress,
  onArchive,
  onDelete,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [modalVisible, setModalVisible] = useState(false);

  const coverUri = book.cover_image ? book.cover_image : null;

  const handleLongPress = () => {
    setModalVisible(true);
  };

  const handleArchive = () => {
    setModalVisible(false);
    if (onArchive) {
      onArchive(book.id, book.status);
    }
  };

  const handleDelete = () => {
    setModalVisible(false);
    if (onDelete) {
      Alert.alert(
        'Confirmer la suppression',
        `Voulez-vous vraiment supprimer "${book.title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => onDelete(book.id, book.title),
          },
        ]
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        testID={`book-item-${book.id}`}
        style={[
          styles.bookCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow || '#000',
          },
        ]}
        onPress={() => onPress(book.id)}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Couverture */}
        <View style={styles.coverContainer}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.coverPlaceholder,
                {
                  backgroundColor: colors.primary + '20',
                },
              ]}
            >
              <Text style={[styles.coverPlaceholderText, { color: colors.primary }]}>
                📚
              </Text>
            </View>
          )}
        </View>

        {/* Infos */}
        <View style={styles.bookInfo}>
          <Text
            style={[styles.bookTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {book.title}
          </Text>

          <View style={styles.bookRow}>
            <Text
              style={[styles.bookAuthor, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {book.author}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    book.status === 'active' ? colors.success : colors.danger,
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {book.status === 'active' ? 'Actif' : 'Archivé'}
              </Text>
            </View>
          </View>

          {book.year && (
            <Text style={[styles.bookYear, { color: colors.textMuted }]}>
              {book.year}
            </Text>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Text style={[styles.arrowText, { color: colors.textMuted }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Modal d'actions rapides */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow || '#000',
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Actions rapides
            </Text>

            <TouchableOpacity
              style={[
                styles.modalAction,
                {
                  borderBottomColor: colors.border,
                  backgroundColor: colors.primary + '10',
                },
              ]}
              onPress={() => {
                setModalVisible(false);
                onPress(book.id);
              }}
            >
              <Text style={[styles.modalActionText, { color: colors.primary }]}>
                ✏️ Modifier
              </Text>
            </TouchableOpacity>

            {onArchive && (
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: colors.warning + '15',
                  },
                ]}
                onPress={handleArchive}
              >
                <Text style={[styles.modalActionText, { color: colors.warning }]}>
                  {book.status === 'active' ? '📁 Archiver' : '📂 Désarchiver'}
                </Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  {
                    backgroundColor: colors.danger + '15',
                  },
                ]}
                onPress={handleDelete}
              >
                <Text style={[styles.modalActionText, { color: colors.danger }]}>
                  🗑️ Supprimer
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AdminBookCard;
