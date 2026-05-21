import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MoreVertical } from "lucide-react-native";

interface BookActionsProps {
  onDeleteFromServer: () => void;
  onDeleteFromDisk: () => void;
  isDownloaded: boolean;
}

export default function BookActions({
  onDeleteFromServer,
  onDeleteFromDisk,
  isDownloaded,
}: BookActionsProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Bouton trois points */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        <MoreVertical color="#666" size={22} />
      </TouchableOpacity>

      {/* Menu contextuel */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("✏️ Edit");
                setVisible(false);
              }}
            >
              <Text style={styles.menuText}>Éditer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                Alert.alert(
                  "Supprimer du serveur",
                  "Attention : cette action supprimera définitivement le livre de la bibliothèque pour TOUS les utilisateurs.",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: onDeleteFromServer,
                    },
                  ],
                );
              }}
            >
              <Text style={[styles.menuText, { color: "red" }]}>Supprimer</Text>
            </TouchableOpacity>

            {isDownloaded && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setVisible(false);
                  Alert.alert(
                    "Libérer de l'espace",
                    "Voulez-vous supprimer le fichier local ? Le livre restera disponible sur le serveur.",
                    [
                      { text: "Annuler", style: "cancel" },
                      {
                        text: "Supprimer du disque",
                        style: "destructive",
                        onPress: onDeleteFromDisk,
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.menuText}>Supprimer du disque</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("📦 Archive");
                setVisible(false);
              }}
            >
              <Text style={styles.menuText}>Archiver</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 10,
    width: 200,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
