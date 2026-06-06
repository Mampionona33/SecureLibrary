import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { File, Directory, Paths } from "expo-file-system";
import Pdf from "react-native-pdf";

export default function ReaderScreen() {
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [pdfSource, setPdfSource] = useState<{
    uri: string;
    cache: boolean;
  } | null>(null);
  const router = useRouter();

  const booksDir = new Directory(Paths.document, "books");
  const bookFile = id ? new File(booksDir, `${id}.pdf`) : null;

  useEffect(() => {
    const backAction = () => {
      router.replace("/(drawer)/home");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [router]);

  useEffect(() => {
    if (id) {
      checkPdf();
    }
  }, [id]);

  const checkPdf = () => {
    if (!id || !bookFile) return;

    try {
      setLoading(true);

      if (!bookFile.exists) {
        Alert.alert(
          "Fichier introuvable",
          "Le livre n'a pas pu être trouvé en local. Recommencez le téléchargement.",
        );
        router.replace("/(drawer)/home");
        return;
      }

      const uri =
        Platform.OS === "android" && !bookFile.uri.startsWith("file://")
          ? `file://${bookFile.uri}`
          : bookFile.uri;

      console.log("📄 PDF local prêt à être lu :", uri);

      setPdfSource({ uri, cache: true });
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Erreur accès :", error.message);
      setLoading(false);
      Alert.alert("Erreur", "Impossible d'accéder au fichier local.");
      router.replace("/(drawer)/home");
    }
  };

  if (!id) {
    return (
      <View style={renderStyles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={renderStyles.loadingText}>
          Attente des informations de navigation...
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={renderStyles.center}>
        <ActivityIndicator size="large" color="#2F66DD" />
        <Text style={renderStyles.loadingText}>
          Préparation de votre livre...
        </Text>
      </View>
    );
  }

  return (
    <View style={renderStyles.container}>
      <View style={renderStyles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(drawer)/home")}
          style={renderStyles.backButton}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={renderStyles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={renderStyles.pdfContainer}>
        {pdfSource ? (
          <Pdf
            source={pdfSource}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Livre chargé. Nombre de pages : ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Page actuelle: ${page}`);
            }}
            onError={(error) => {
              console.error("Erreur de lecture du PDF:", error);
              Alert.alert("Erreur", "Impossible de lire ce document PDF.");
            }}
            onPressLink={(uri) => {
              console.log(`Lien cliqué : ${uri}`);
            }}
            style={renderStyles.pdf}
            trustAllCerts={false}
          />
        ) : (
          <Text style={renderStyles.errorText}>Document indisponible.</Text>
        )}
      </View>
    </View>
  );
}

const renderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#2F66DD",
    zIndex: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "500",
  },
});
