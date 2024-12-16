import React, { useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import CategoryCard from "../../components/CategoryCard";

// Obtiene el ancho de la pantalla para estilos responsivos
const { width } = Dimensions.get("window");

// Dimensiones de las tarjetas y espaciado
const CARD_WIDTH = width * 0.7;
const SPACING = 10;
const SIDE_SPACING = (width - CARD_WIDTH) / 2;

// Datos de las categorías disponibles
const categories = [
  { title: "Sneakers", image: "../assets/brand/Tenis.png", id: 1 },
  { title: "Supermercado", image: "../assets/brand/Mercado.png", id: 2 },
  {title:"Tecnología", image:"../assets/brand/Tecnologia.png", id: 3},
];

// Componente principal
export default function CategoriesScreen() {
  const [scrollX] = useState(new Animated.Value(0)); // Estado para la posición del scroll
  const router = useRouter(); // Manejo de navegación

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.heading}>Categorías</Text>
        <Text style={styles.subHeading}>Tu búsqueda empieza aquí</Text>
      </View>

      {/* Scroll horizontal de categorías */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false} // Oculta la barra de scroll horizontal
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={CARD_WIDTH + SPACING} // Ajusta el scroll al tamaño de cada tarjeta
        decelerationRate="fast" // Velocidad de desaceleración del scroll
        scrollEventThrottle={16} // Frecuencia de eventos de scroll
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        contentInset={{
          left: SIDE_SPACING,
          right: SIDE_SPACING,
        }}
        contentOffset={{ x: -SIDE_SPACING, y: 0 }}
      >
        {/* Mapeo de categorías */}
        {categories.map((category, index) => {
          if (!category) return null; // Evita procesar categorías indefinidas

          // Rango de entrada para interpolación de escala
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          // Escala interpolada para animación
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9], // Escala mínima, máxima y mínima
            extrapolate: "clamp", // Restringe los valores fuera del rango
          });

          return (
            <Animated.View
              key={index}
              style={[styles.cardContainer, { transform: [{ scale }] }]}
            >
              {/* Navegación a la categoría seleccionada */}
              <TouchableOpacity
                onPress={() => {
                  console.log("Navegando a la categoría:", category.id);
                  router.push({
                    pathname: "/category/[category]",
                    params: { category: category.id.toString() },
                  });
                }}
              >
                <CategoryCard
                  title={category.title}
                  category={category.id}
                  onPress={() => {
                    console.log("Navegando a la categoría:", category.id);
                    router.push({
                      pathname: "/category/[category]",
                      params: { category: category.id.toString() },
                    });
                  }}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: "#9693ff", // Fondo morado claro
    paddingVertical: 20,
  },
  // Encabezado
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: "#252376",
    textAlign: "center",
    marginBottom: 20,
  },
  // Contenedor de scroll
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: SIDE_SPACING, // Espaciado a los lados del scroll
  },
  // Contenedor de las tarjetas
  cardContainer: {
    width: CARD_WIDTH, // Ancho de la tarjeta
    marginHorizontal: SPACING / 2, // Espaciado entre tarjetas
  },
});
