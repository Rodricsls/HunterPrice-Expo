import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

function ProductCard({
  image,
  brand,
  name,
  description,
  id,
  user,
}: {
  image: string;
  brand: string | undefined;
  name: string;
  description: string;
  id: string;
  user?: { id: string; nombre: string } | null; // User data (optional)
}) {
  const router = useRouter();

  const handleCardPress = async () => {
    try {
      // Log user interaction if user data exists
      console.log("User data:", user);
      if (user?.id) {
        const response = await fetch("https://api.hunterprice.online/api/logUserSearch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_id: user.id,
            identifier: id,
          }),
        });
        console.log("Response:", response);
      }
    } catch (error) {
      console.error("Error logging user interaction:", error);
      Alert.alert("Error", "Failed to log user interaction.");
    }
  
    // Navigate to the product page with parameters
    router.push({
      pathname: "/(tabs)/product/[product]", // Ensure the dynamic segment matches your route definition
      params: {
        product: id, // Map the `id` to the `product` dynamic segment
        userId: user?.id || "unknown", // Add the `userId` parameter
        userName: user?.nombre || "Guest", // Add the `userName` parameter
      },
    });
  };

    // Navigate to the product page
  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="stretch"
          resizeMethod="auto"
        />
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>
            {brand ? brand.toUpperCase() : "SIN MARCA"}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.45,
    height: width * 0.55,
    backgroundColor: "black",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    borderWidth: 8,
    borderColor: "black",
    marginVertical: 16,
    alignSelf: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 14,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  brandContainer: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: "black",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: "70%",
  },
  brandText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  content: {
    padding: 9,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export default ProductCard;
