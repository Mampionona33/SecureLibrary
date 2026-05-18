import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MoreVertical } from "lucide-react-native";

export default function BookActions() {
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
                console.log("🗑️ Delete");
                setVisible(false);
              }}
            >
              <Text style={styles.menuText}>Supprimer</Text>
            </TouchableOpacity>

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
