import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/constants/api";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ImageProductScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isFromCamera, setIsFromCamera] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router=useRouter();

  // Función para abrir la galería
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la galería para continuar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setIsFromCamera(false);
      setModalVisible(true);
    }
  };

  // Función para abrir la cámara
  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita acceso a la cámara para continuar.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({

      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setIsFromCamera(true);
      setModalVisible(true);
    }
  };
  // Función para enviar la imagen a la API
  const sendImageToApi = async () => {
    if (!imageUri) return;
  
    try {
            const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

            const response = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      router.push(`/(tabs)/${encodeURIComponent(JSON.stringify(responseData))}` as any);
  
      if (response.ok) {
                Alert.alert("Éxito", "La imagen se ha enviado correctamente.");
      } else {
        Alert.alert("Error", "No se pudo enviar la imagen.");
      }
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      Alert.alert("Error", "Ocurrió un error al enviar la imagen.");
    } finally {
      setModalVisible(false);
      setImageUri(null);
    }
  };
    return (
    <View style={styles.container}>
      {/* Títulos */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>TU PRODUCTO CON UNA</Text>
        <Text style={[styles.title, styles.imageHighlight]}>IMAGEN</Text>
        <Text style={styles.subTitle}>
          Sube tu imagen o toma la foto para encontrar tu producto.
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>Subir foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhotoWithCamera}>
          <Text style={styles.buttonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para mostrar la imagen seleccionada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
            <Text style={styles.modalText}>
              {isFromCamera
                ? "¿Quieres tomar otra foto?"
                : "¿Quieres elegir esta imagen?"}
            </Text>
            <View style={styles.modalButtonContainer}>
              {isFromCamera ? (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    takePhotoWithCamera();
                  }}
                >
                  <Text style={styles.modalButtonText}>Tomar otra</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Elegir otra</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={sendImageToApi}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5F5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  imageHighlight: {
    color: "#7b61ff",
    marginTop: -height * 0.01,
  },
  subTitle: {
    marginTop: height * 0.02,
    fontSize: width * 0.04,
    color: "#444",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#252376",
    width: width * 0.5,
    paddingVertical: height * 0.02,
    borderRadius: width * 0.02,
    marginBottom: height * 0.02,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#252376",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
