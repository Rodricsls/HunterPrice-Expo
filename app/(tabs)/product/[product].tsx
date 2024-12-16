import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import Separator from "@/components/Separator";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { FlashList } from "@shopify/flash-list";
import ProductCard from "@/components/ProductCard";

const { width, height } = Dimensions.get("window");

const handlePress = (link: string) => {
  console.log("Link:", link);
  Linking.canOpenURL(link)
    .then((supported: any) => {
      if (supported) {
        Linking.openURL(link);
      } else {
        console.error("No se puede abrir la URL:", link);
      }
    })
    .catch((err) => console.error("Error al verificar la URL:", err));
};

export default function ProductScreen() {
  const params = useLocalSearchParams();

  const { product } = params;
  const { user } = useAuth(); // Usa el hook para manejar la autenticación
  const [productData, setProductData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [ratingsData, setRatingsData] = useState({
    ratings: [],
    average: 0,
    totalRatings: 0,
    userRating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPercentage = (count: number) => {
    return ratingsData.totalRatings > 0 ? (count / ratingsData.totalRatings) * 100 : 0;
  };


  const submitRating = async () => {
    if (selectedRating === 0) {
      Alert.alert("Error", "Por favor selecciona una calificación.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rateProduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          productId: product,
          rating: selectedRating,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Éxito", data.message);

        const updatedRatingsResponse = await fetch(`${API_BASE_URL}/productRating/${product}`, {
          headers: { "Content-Type": "application/json" },
        });
        const updatedRatings = await updatedRatingsResponse.json();

        setRatingsData({
          ...ratingsData,
          ratings: updatedRatings.ratings,
          average: updatedRatings.average,
          totalRatings: updatedRatings.totalRatings,
        });
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Error al enviar la calificación:", error);
      Alert.alert("Error", "Hubo un problema al enviar tu calificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permiso de ubicación denegado");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          long: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
      }
    };

    fetchUserLocation();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch product, ratings, and recommendations concurrently
      const [productResponse, ratingsResponse, recommendationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/getSingleProduct/${product}`, {
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE_URL}/productRating/${product}`, {
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE_URL}/recommendProducts/${user?.id || 0}/${product}`, {
          headers: { "Content-Type": "application/json" },
        }),
      ]);
  
      const [productInfo, ratings, recommendationsData] = await Promise.all([
        productResponse.json(),
        ratingsResponse.json(),
        recommendationsResponse.json(),
      ]);
  
      console.log("recommendationsData", recommendationsData);
      console.log("productInfo", productInfo);
  
      // Prepare initial store data
      const stores = Object.keys(productInfo.Tiendas).map((storeKey) => ({
        id: storeKey,
        name: productInfo.Tiendas[storeKey],
        price: productInfo.Precios[productInfo.Tiendas[storeKey]],
        link: productInfo.Referencias[productInfo.Tiendas[storeKey]],
      }));
  
      // If userLocation exists, fetch nearest location for each store
      const storesWithLocation =
        userLocation &&
        (await Promise.all(
          stores.map(async (store) => {
            try {
              const nearestStoreResponse = await fetch(
                `${API_BASE_URL}/nearest-location/?tienda=${store.id}&longitud=${userLocation.long}&latitud=${userLocation.lat}`,
                { headers: { "Content-Type": "application/json" } }
              );
              const nearestStoreData = await nearestStoreResponse.json();
              return {
                ...store,
                nearestLocation: nearestStoreData.distanceInKm,
                nearestLocationLatitude: nearestStoreData.latitud,
                nearestLocationLongitude: nearestStoreData.longitud,
              };
            } catch (error) {
              console.error(`Error fetching nearest location for store ${store.id}:`, error);
              return store; // Return the store without nearest location if fetch fails
            }
          })
        ));
      console.log("storesWithLocation", storesWithLocation);
      setProductData({
        name: productInfo.Nombre,
        description: `${productInfo.Caracteristicas.marca} - ${productInfo.Caracteristicas.categoria}`,
        imageUrl: productInfo.ImagenURL,
        stores: userLocation ? storesWithLocation : stores, // Include nearest location data if fetched
        ar:productInfo.ar
      });
      console.log("productData", productData);
  
      setRatingsData({
        ratings: ratings.ratings,
        average: ratings.average,
        totalRatings: ratings.totalRatings,
        userRating: ratings.userRating || 0,
      });
  
      setRecommendations(recommendationsData.recommendations);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error loading product data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user) return; // Wait until the user is defined
    fetchData();
  }, [product, userLocation, user]); // Depend on `user`
  

  // Verify if the product is liked when the component mounts
  useEffect(() => {
    if (!user) return; // Wait until the user is defined
  
    const verifyLikeStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/verifyLike/${user.id}/${product}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to verify like status");
        }
  
        const data = await response.json();
        setIsLiked(data.liked);
      } catch (error) {
        console.error("Error verifying like status:", error);
        setIsLiked(false); // Default to not liked if there's an error
      }
    };
  
    verifyLikeStatus();
  }, [product, user]); // Depend on `user` and `product`
  

  // Handle like toggle
  const handleLikeToggle = async () => {
    try {
      // Determine the endpoint based on the current `isLiked` state
      const endpoint = isLiked ? `${API_BASE_URL}/dislikeProduct` : `${API_BASE_URL}/likeProduct`;
      
      // Perform the API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id, // Ensure `user.id` is provided
          productId: product, // Pass the product identifier
        }),

      });
      console.log("Response status:", response);
  
      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? "dislike" : "like"} product`);
      }
  
      // Toggle the `isLiked` state upon success
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error(`Error handling ${isLiked ? "dislike" : "like"} action:`, error);
      Alert.alert("Error", `Unable to ${isLiked ? "dislike" : "like"} the product. Please try again.`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Cargando producto...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Imagen del producto */}
      <Image source={{ uri: productData.imageUrl }} style={styles.productImage} />

      {/* Product Information */}
<View style={styles.productDetails}>
  {/* Row with product name and like button */}
  <View style={styles.nameRow}>
  <Text style={styles.productName}>{productData.name}</Text>
  <TouchableOpacity
    style={styles.likeButton}
    onPress={handleLikeToggle}
    disabled={isLiked === null}
  >
    <Text style={[styles.likeButtonText, isLiked ? styles.liked : styles.notLiked]}>
      {isLiked ? "♥" : "♡"}
    </Text>
  </TouchableOpacity>
</View>

<Text style={styles.productBrand}>{productData.marca}</Text>

{/* Mostrar descripción solo si no está indefinida */}
{productData.description && (
  <Text style={styles.productDescription}>{productData.description}</Text>
)}

{/* Mostrar botón de enlace solo si productData.ar no es null */}
{productData.ar && (
  <TouchableOpacity
    style={styles.arButton}
    onPress={() => {
      Linking.openURL(productData.ar)
        .catch((err) => console.error("Error opening AR link:", err));
    }}
  >
    <Text style={styles.arButtonText}>Ver en AR</Text>
  </TouchableOpacity>
)}

</View>
<Separator/>
      {/* Tiendas */}
      <Text style={styles.sectionTitle}>Tiendas</Text>
      <View style={styles.storeList}>
        {productData.stores.map((store: any, index: number) => (
          <View key={index} style={styles.storeContainer}>
            {/* Icono de ubicación */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/map",
                  params: { tienda: store.id, longitud: store.nearestLocationLongitude, latitud:store.nearestLocationLatitude },
                })
              }
              style={styles.storeIconWrapper}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color="white"
                style={styles.storeIcon}
              />
            </TouchableOpacity>

            {/* Distancia */}
            <View style={styles.nearestLocationContainer}>
              <Text style={styles.nearestLocationText}>{store.nearestLocation} Km</Text>
            </View>

            {/* Nombre de la tienda */}
            <View style={styles.storeNameContainer}>
              <Text style={styles.storeName}>{store.name}</Text>
            </View>

            {/* Precio */}
            <View style={styles.storePriceContainer}>
              <Text style={styles.storePrice}>Q{store.price}</Text>
            </View>

            {/* Botón "Ir a tienda" */}
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() => handlePress(store.link)}
            >
              <Text style={styles.storeButtonText}>Ir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
        <Separator/>
      {/* Ranking */}
      <View>
      {/* Ranking Section */}
      <Text style={styles.sectionTitle}>Ranking</Text>
      <View style={styles.starsContainer}>
  {/* Selectable Stars */}
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => !isSubmitting && setSelectedRating(star)} // Disable interaction during loading
        disabled={isSubmitting}
      >
        <Ionicons
          name={star <= (selectedRating || ratingsData.userRating) ? "star" : "star-outline"}
          size={24}
          color={star <= (selectedRating || ratingsData.userRating) ? "#FF6F00" : "#000"}
          style={styles.star}
        />
      </TouchableOpacity>
    ))}
  </View>
  {/* Button to Submit Rating */}
  <TouchableOpacity
    style={styles.submitButton}
    onPress={submitRating}
    disabled={isSubmitting} // Disable button during loading
  >
    {isSubmitting ? (
      <Text style={styles.submitButtonText}>Cargando...</Text> // Show loading text
    ) : (
      <Text style={styles.submitButtonText}>Calificar</Text>
    )}
  </TouchableOpacity>
</View>

      {/* Rating Breakdown */}
      <View style={styles.ratingBreakdownContainer}>

        {/* Breakdown Bars */}
        <View style={styles.breakdownContainer}>
          {ratingsData.ratings.map((rating: { calificacion: string; count: number }) => (
            <View key={rating.calificacion} style={styles.breakdownRow}>
              <Text style={styles.ratingLabel}>{rating.calificacion}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getPercentage(rating.count)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
        {/* Average Rating */}
        <View style={styles.averageContainer}>
        <Text style={styles.averageRating}>
  {isNaN(ratingsData.average) ? 0 : ratingsData.average}
</Text>
          <Text style={styles.totalRatings}>({ratingsData.totalRatings || 0} calificaciones)</Text>
        </View>

        
      </View>
    </View>
    <View style={styles.screen}>
      {/* Header with Orange Bar */}
      <View style={styles.header}>
        <Image source={require('@/assets/brand/logo_white.png')} style={styles.logo} />
        </View>
        <Text style={styles.sectionTitle}>Similares</Text>
        <FlashList
          data={recommendations}
          horizontal
          keyExtractor={(item) => item.identifier}
          renderItem={({ item }) => (
            <View style={styles.recommendationWrapper}>
              <ProductCard
                image={item.imagenurl}
                brand={item.marca}
                name={item.nombreDisplay}
                description="d"
                id={item.identifier}
                user={user}
              />
            </View>
          )}
          estimatedItemSize={200}
          contentContainerStyle={styles.recommendationList}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
    
  );
}


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  arButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFA500",
    borderRadius: 5,
    alignItems: "center",
  },
  arButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
  },
  nameRow: {
    flexDirection: "row", // Align items horizontally
    justifyContent: "space-evenly", // Space between product name and like button
    alignItems: "center", // Align items vertically
    marginBottom: 4, // Add some spacing below the row
  },
  productImage: {
    width: "100%",
    height: height * 0.5,
    resizeMode: "contain",
  },
  productDetails: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  productBrand: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    flex: 1, // Allow product name to take available space
  },
  productDescription: {
    fontSize: 14,
    color: "#aaa",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 20,
  },
  storeList: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  store: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  storeIconContainer: {
    padding: 5,
    borderRadius: 12,
  },
  storeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  storeIconWrapper: {
    padding: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
    storeIcon: {
      alignSelf: "center",
    marginRight: 2, // Separación entre el ícono y la información
  },
  nearestLocationContainer: {
    backgroundColor: "#252525", // Fondo de la distancia
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  nearestLocationText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
   storeNameContainer: {
    flex: 1,
    backgroundColor: "#252525", // Fondo del nombre de la tienda
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  storeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
   textAlign: "center",
  },
  storePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6F00",
  },
  storePriceContainer: {
    backgroundColor: "#252525", // Fondo del precio
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  storeButton: {
    backgroundColor: "#FF6F00", // Fondo del botón
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  storeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  ratingSection: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "white",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: 20,
  },
  stars: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  star: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 12,
    backgroundColor: "black", // Fondo negro para las estrellas
  },
  submitButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingBreakdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  averageContainer: {
    alignItems: "center",
    marginLeft: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  totalRatings: {
    fontSize: 10,
    color: "#aaa",
  },
  breakdownContainer: {
    flex: 1,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#fff",
    marginRight: 8,
    width: 20,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "white",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6F00",
  },
  ratingCount: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  calificacion: {
    flexDirection: "column", // Asegura que el promedio y el total se alineen correctamente
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  likeButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: 50, // Rounded button
    padding: 8, // Add padding for better touch experience
    alignItems: "center",
  },
  likeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  liked: {
    fontSize: 24,
    color: "red",
  },
  notLiked: {
    fontSize: 24,
    color: "white",
  },
  recommendationList: {
    paddingHorizontal: 16,
  },
  recommendationWrapper: {
    marginHorizontal: 10, // Increased horizontal spacing
  },
  screen:{
    flex:1,
    backgroundColor:'white',

  },
  header: {
    backgroundColor: "#FF6F00", // Orange background
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logo: {
    width:'100%',
    height: 40,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
