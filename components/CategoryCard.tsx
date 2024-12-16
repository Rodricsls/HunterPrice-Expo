import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// Importación de imágenes para las categorías
import Tenis from '../assets/brand/Tenis.png';
import Mercado from '../assets/brand/Mercado.png';
import Tecnologia from '../assets/brand/Tecnologia.png';

// Obtener las dimensiones de la pantalla
const { width } = Dimensions.get('window');

// Componente de tarjeta para categorías
export default function CategoryCard({
  title,
  onPress,
  category,
}: {
  title: string; // Título de la categoría
  onPress: () => void; // Función que se ejecuta al presionar la tarjeta
  category: number; // ID de la categoría
}) {
  // Función para determinar la imagen dependiendo del ID de la categoría
  const getCategoryImage = (categoryId: number) => {
    switch (categoryId) {
      case 1:
        return Tenis; // Imagen para "Sneakers"
      case 2:
        return Mercado; // Imagen para "Supermercado"
      case 3:
        return Tecnologia; // Imagen para "Tecnología"
      default:
        return null; // Imagen por defecto o ninguno
    }
  };

  // Obtener la imagen correspondiente al ID de la categoría
  const categoryImage = getCategoryImage(category);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {/* Renderizar la imagen dependiendo del ID */}
        {categoryImage && <Image source={categoryImage} style={styles.image} />}
        {/* Título de la categoría */}
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Estilos para el componente
const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 8,
    width: width * 0.7, // Ancho responsivo para un carrusel
  },
  imageContainer: {
    width: width * 0.7, // Ancho responsivo para un carrusel
    height: 400, // Altura fija para las tarjetas
    backgroundColor: '#252376', // Color de fondo de las tarjetas
    justifyContent: 'center', // Centrar el contenido verticalmente
    alignItems: 'center', // Centrar el contenido horizontalmente
    borderRadius: 8, // Bordes redondeados
    overflow: 'hidden', // Asegura que el contenido no se salga de los bordes
    position: 'relative', // Necesario para posicionar el texto de forma absoluta
  },
  image: {
    height: 300, // Altura de la imagen
    resizeMode: 'contain', // Escalar la imagen sin distorsionar
  },
  title: {
    position: 'absolute', // Posiciona el texto sobre el contenedor
    bottom: 10, // Ubica el texto cerca del borde inferior
    fontSize: 20, // Tamaño de fuente
    fontWeight: 'bold', // Negrita para destacar el título
    textAlign: 'center', // Centra el texto
    color: '#ffffff', // Color blanco para mejor legibilidad
    paddingHorizontal: 8, // Espaciado horizontal
    paddingVertical: 4, // Espaciado vertical
    borderRadius: 4, // Bordes redondeados para un efecto de etiqueta
  },
});
