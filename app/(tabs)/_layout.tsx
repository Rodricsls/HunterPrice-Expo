import React, { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Image, StyleSheet, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth'; // Hook personalizado
import API_BASE_URL from '@/constants/api';

export default function TabsLayout() {
  const { user, loading, signOut } = useAuth(); // Usa el hook para manejar la autenticación
  const [query, setQuery] = useState(''); // Almacena el texto de búsqueda ingresado
  const [suggestions, setSuggestions] = useState([]); // Almacena las sugerencias de búsqueda
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Indica si se están cargando sugerencias
  const [tooltipVisible, setTooltipVisible] = useState(false); // Controla la visibilidad del menú desplegable del perfil
  const [isFocused, setIsFocused] = useState(false); // Indica si el campo de búsqueda está enfocado

  // Escucha el estado del usuario y redirige según corresponda
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/landing'); // Redirige a la pantalla de inicio de sesión si no hay usuario
    }
  }, [loading, user]);

  // Maneja la obtención de sugerencias para la búsqueda
  const fetchSuggestions = async (searchText: string) => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/autocomplete/${searchText}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error al obtener sugerencias:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Realiza una búsqueda automática con un retraso para evitar llamadas excesivas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Renderiza cada sugerencia en la lista
  const renderSuggestion = ({ item }: { item: { nombre_producto: string } }) => (
    <TouchableOpacity style={styles.suggestion} onPress={() => setQuery(item.nombreDisplay)}>
      <Text style={styles.suggestionText}>{item.nombreDisplay}</Text>
    </TouchableOpacity>
  );
  if (loading) {
    return <Text style={{ textAlign: 'center', marginTop: 50, color: 'black' }}>Cargando...</Text>; // Indicador de carga mientras se verifica la sesión
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra superior fija con barra de búsqueda y perfil */}
      <View style={styles.stickyHeader}>
        <View style={styles.navbar}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="white" />
            <TextInput
              placeholder="Buscar"
              cursorColor="white"
              placeholderTextColor="white"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={() => {
                router.push({
                  pathname: '/search/[searchText]',
                  params: { searchText: query },
                });
              }}
            />
          </View>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>Hola {user?.nombre.split(" ")[0]  || 'Usuario'}</Text>
            <TouchableOpacity onPress={() => setTooltipVisible(!tooltipVisible)}>
              <Ionicons name="person-circle" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menú desplegable para cerrar sesión */}
        {tooltipVisible && (
          <View style={styles.tooltip}>
            <TouchableOpacity onPress={signOut}>
              <Text style={styles.tooltipText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lista de sugerencias */}
      {isFocused && (
        <View style={styles.suggestionsContainer}>
          {loadingSuggestions && <Text style={styles.loading}>Cargando...</Text>}
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSuggestion}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Pestañas inferiores */}
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'black',
            borderTopWidth: 0,
            height: 60,
          },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../../assets/images/home.png')}
                  style={[styles.tabIcon, focused && styles.tabIconFocused]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
            href: '/(tabs)/home',
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../../assets/images/categorias blanco.png')}
                  style={[styles.tabIcon, focused && styles.tabIconFocused]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
            href: '/(tabs)/categories',
          }}
        />
        <Tabs.Screen
          name="Image"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../../assets/images/camara blanco.png')}
                  style={[styles.tabIcon, focused && styles.tabIconFocused]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
            href: '/(tabs)/Image',
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../../assets/images/fav blanco.png')}
                  style={[styles.tabIcon, focused && styles.tabIconFocused]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
            href: '/(tabs)/favorites',
          }}
        />
        {/* Ocultar pantallas no directamente accesibles */}
        <Tabs.Screen name="category/[category]" options={{ href: null }} />
        <Tabs.Screen name="product/[product]" options={{ href: null }} />
        <Tabs.Screen name="search/[searchText]" options={{ href: null }} />
        <Tabs.Screen name="map" options={{ href: null }} />
        <Tabs.Screen name="[Imagesearch]" options={{ href: null }} />
      </Tabs>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Estilos generales
  stickyHeader: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    backgroundColor: 'black',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '100%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // Estilos para la barra de búsqueda
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    height: 40,
    flex: 1,
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
  },

  // Estilos para el perfil
  profileIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    marginRight: 8,
  },

  // Estilos para la lista de sugerencias
  suggestionsContainer: {
    position: "absolute",
    top: 80, // Asegúrate de que este valor sea igual a la altura del header
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1,
    maxHeight: 200, // Altura máxima de la lista
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10, // Para sombras en Android
  },
  suggestionsList: {
    paddingHorizontal: 10,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color:'black'
  },

  // Estilos para el tooltip
  tooltip: {
    position: 'absolute',
    right: 10,
    top: 70,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // Estilos para la carga
  loading: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },

  // Estilos para los íconos de las pestañas
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  tabIcon: {
    width: 25,
    height: 25,
    tintColor: '#7f8c8d',
  },
  tabIconFocused: {
    tintColor: 'white',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: 'white',
    marginTop: 2,
  },
});
