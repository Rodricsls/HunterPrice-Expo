import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@/components/ProductCard"; // Ensure the path to ProductCard is correct

const API_BASE_URL = "https://api.hunterprice.online/api";

export default function Favorites({ user }: { user: { id: string; nombre: string } | null }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = user
          ? `${API_BASE_URL}/getUserLikedProducts/${user.id}`
          : `${API_BASE_URL}/getMostViewed`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (Array.isArray(data.likedProducts)) {
          setProducts(data.likedProducts);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Unexpected API response format:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          {user
            ? "Aún no tienes productos en tus favoritos."
            : "No hay productos más vistos disponibles."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user ? "FAVORITOS" : "LO MÁS VISTO"}
        </Text>
        <Text style={styles.subtitle}>
          {user ? "TU COLECCIÓN PERSONAL" : "PRODUCTOS POPULARES"}
        </Text>
      </View>

      <FlashList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              image={item.imagenurl}
              brand={item.marca}
              name={item.nombreDisplay}
              description=""
              id={item.identifier}
              user={user}
            />
          </View>
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6F00",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardWrapper: {
    flex: 1,
    padding: 8,
  },
});
