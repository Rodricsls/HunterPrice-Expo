import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import ProductCard from "../../components/ProductCard";
import API_BASE_URL from "@/constants/api";
import { useAuth } from "../../hooks/useAuth";

// Obtiene el ancho de la pantalla para adaptar estilos responsivos
const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [mostSearched, setMostSearched] = useState([]); // Productos más buscados
  const [recentlyAdded, setRecentlyAdded] = useState([]); // Productos agregados recientemente
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Manejo de errores
  const router = useRouter(); // Navegación
  const { user } = useAuth(); // Estado de autenticación

  // Función para obtener productos más buscados
  const fetchMostSearched = async () => {
    const response = await fetch(`${API_BASE_URL}/getMostViewed`);
    const data = await response.json();
    return data;
  };

  // Función para obtener productos recientemente agregados
  const fetchRecentlyAdded = async () => {
    const response = await fetch(`${API_BASE_URL}/getRecentlyAdded`);
    const data = await response.json();
    return data;
  };

  // Función para obtener datos de ambas categorías simultáneamente
  const fetchData = async () => {
    try {
      const [mostSearchedData, recentlyAddedData] = await Promise.all([
        fetchMostSearched(),
        fetchRecentlyAdded(),
      ]);
      setMostSearched(mostSearchedData);
      setRecentlyAdded(recentlyAddedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    }
  };

  // Maneja la carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, []);

  // Renderizado en caso de estado de carga
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Cargando datos...</Text>
      </View>
    );
  }

  // Renderizado en caso de error
  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Renderizado principal
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image source={require("../../assets/brand/HunterPrice.png")} style={styles.logo} />
          <Text style={styles.subtitle}>¿Tienes una imagen del producto que buscas?</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/Image")}>
            <Text style={styles.buttonText}>¡Quiero saber más!</Text>
          </TouchableOpacity>
        </View>

        {/* Sección "PRODUCTOS MÁS BUSCADOS" */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUCTOS MÁS BUSCADOS DE LA SEMANA</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {mostSearched.map((product: any) => (
              <View style={styles.cardContainer} key={product.identifier}>
                <ProductCard
                  image={product.imagenurl}
                  brand={product.marca}
                  name={product.nombreDisplay}
                  description={product.descripcion}
                  id={product.identifier}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Sección "AGREGADOS RECIENTEMENTE" */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AGREGADOS RECIENTEMENTE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {recentlyAdded.map((product: any) => (
              <View style={styles.cardContainer} key={product.identifier}>
                <ProductCard
                  image={product.imagenurl}
                  brand={product.valor}
                  name={product.nombreDisplay}
                  description={product.descripcion}
                  id={product.identifier}
                  user={user}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};
// Estilos
const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },

  // Encabezado
  header: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  logo: {
    width: 300,
    height: 32,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#252376',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Secciones
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
  },

  // Skeleton styles
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },

  // Cards
  cardContainer: {
    marginRight: 12,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },

  // Errores
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default HomeScreen;
