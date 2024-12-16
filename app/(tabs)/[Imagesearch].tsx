import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@/components/ProductCard"; // Adjust the import path for your project
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";

interface Product {
  identifier: string;
  imagenurl: string;
  nombreDisplay: string;
  nombrecaracteristica: string;
  valor: string;
}

export default function ProductsPage() {
  const {Imagesearch} = useLocalSearchParams();
  console.log("ImageSearch:", JSON.parse(decodeURIComponent(Imagesearch as string)));
   // Retrieve search params and user
    const {user}=useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!Imagesearch) {
        throw new Error("Products parameter is missing");
      }

      const imageSearchString = Array.isArray(Imagesearch) ? Imagesearch[0] : Imagesearch;
      const parsedProducts: Product[] = JSON.parse(decodeURIComponent(imageSearchString));
      setProducts(parsedProducts);
    } catch (error) {
      console.error("Error parsing products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [Imagesearch]);

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
          No se encontró ningún resultado en base a tu búsqueda.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlashList
        data={products}
        keyExtractor={(item) => item.identifier}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            id={item.identifier}
            image={item.imagenurl}
            brand={item.valor}
            name={item.nombreDisplay}
            description=""
            user={user}
          />
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  listContent: {
    paddingHorizontal: 8,
    marginHorizontal: 20,
  },
});
