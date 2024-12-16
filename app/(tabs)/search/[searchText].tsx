import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import ProductCard from "@/components/ProductCard";
import { useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import API_BASE_URL from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";

const { width } = Dimensions.get("window");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Product {
  productoid: string;
  imagenurl: string;
  marca: { valor: string };
  nombreDisplay: string;
  _id: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const{user}= useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { searchText } = useLocalSearchParams();
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const pageSize = 20;

  const fetchSearch = async (newPage: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/?searchText=${searchText}&page=${newPage}&pageSize=${pageSize}`,
        { method: "GET" }
      );
      const data = await response.json();

      setProducts((prev) => [...prev, ...data.results]);
      setHasNextPage(data.hasNextPage);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error loading products.");
    }
  };

  const fetchInitialData = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    console.log("Fetching initial data...");
    setProducts([]);
    setPage(0);
    setHasNextPage(true);
    setError(null);
    try {
      await fetchSearch(0);
      console.log("Initial data fetched successfully.");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error loading products.");
    } finally {
      console.log("Initial loading completed.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting the loading");
      setIsInitialLoading(true);
      await fetchInitialData();
      console.log("Ending the loading");
      setIsInitialLoading(false);
    };
    fetchData();
  }, [searchText]);

  const handleEndReached = async () => {
    if (isFetching || !hasNextPage) return;
    setIsFetching(true);
    await fetchSearch(page + 1);
    setPage((prev) => prev + 1);
    setIsFetching(false);
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlashList
        key={Array.isArray(searchText) ? searchText[0] : searchText}
        data={products}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        numColumns={2}
        estimatedItemSize={200}
        contentContainerStyle={styles.flashListContainer}
        viewabilityConfig={{
          waitForInteraction: false,
        }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              image={item.imagenurl}
              brand={item.marca.valor}
              name={item.nombreDisplay}
              description={item.nombreDisplay}
              id={item._id}
              user={user}
            />
          </View>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
        extraData={products}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 10,
  },
  flashListContainer: {
    padding: 15,
    backgroundColor: "white",
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
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

export default ProductList;
