import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@/components/ProductCard";
import { useLocalSearchParams } from "expo-router/build/hooks";
import API_BASE_URL from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
const { width } = Dimensions.get("window");

type Category = { nombre: string; id: number };
type Product = {
  identifier: string;
  imagenurl: string;
  nombreDisplay: string;
  marca?: string;
  [key: string]: any; // Add this if products have additional properties
};

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryScrollRef = useRef<ScrollView | null>(null); // Ref for category bar
  const { category } = useLocalSearchParams(); // Main category
  const productCache = useRef<Record<number, Product[]>>({}); // Cache products by category
  const { user } = useAuth(); // Usa el hook para manejar la autenticación

  // Fetch initial categories and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/getSubcategories/${category}`),
          fetch(`${API_BASE_URL}/getProducts/${category}`),
        ]);

        const categoriesData: Category[] = await categoriesResponse.json();
        const productsData: Product[] = await productsResponse.json();

        setCategories([{ nombre: "Todo", id: 0 }, ...categoriesData]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        productCache.current[0] = productsData; // Cache initial products
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  // Fetch products for a specific subcategory
  const fetchSubcategoryProducts = async (subcategoryId: number) => {
    if (productCache.current[subcategoryId]) {
      // Use cached products if available
      setFilteredProducts(productCache.current[subcategoryId]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getProducts/${subcategoryId}`);
      const data: Product[] = await response.json();
      setFilteredProducts(data);
      productCache.current[subcategoryId] = data; // Cache products
    } catch (err) {
      console.error("Error fetching subcategory products:", err);
      setError("Error loading subcategory products.");
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection and scroll to it
  const handleCategorySelect = (subcategoryId: number) => {
    setSelectedCategory(subcategoryId);

    // Scroll to the selected category
    const index = categories.findIndex((cat) => cat.id === subcategoryId);
    if (index !== -1 && categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({
        x: index * 120, // Adjust for item width and spacing
        animated: true,
      });
    }

    if (subcategoryId === 0) {
      setFilteredProducts(products); // Show all products
    } else {
      fetchSubcategoryProducts(subcategoryId); // Filter products by subcategory
    }
  };

  const handleEndReached = () => {
    console.log("End reached, load more data if applicable");
    // Add logic here for pagination or loading more items
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Categories Bar */}
      <View style={styles.categoryBarContainer}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBarContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategoryItem,
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FlashList */}
      <FlashList
        data={filteredProducts}
        keyExtractor={(item, index) => `${item.identifier ?? index}-${index}`}
        numColumns={2}
        estimatedItemSize={200}
        contentContainerStyle={styles.flashListContainer}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              image={item.imagenurl}
              name={item.nombreDisplay}
              id={item.identifier ?? ""}
              brand={item.marca ?? ""}
              description={""}
              user={user}
            />
          </View>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
        extraData={filteredProducts}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  categoryBarContainer: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 10,
    marginTop: 12,
  },
  categoryBarContent: {
    paddingHorizontal: 10,
    marginTop:12,
    alignItems: "center",
  },
  categoryItem: {
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: "#6A4DA8",
  },
  selectedCategoryItem: {
    backgroundColor: "#4A2D8B",
  },
  categoryText: {
    color: "white",
    fontSize: 14,
  },
  selectedCategoryText: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  flashListContainer: {
    padding: 15,
  },
  cardWrapper: {
    margin: 10,
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
