import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import MapboxGL, { PointAnnotation } from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import API_BASE_URL from "@/constants/api";

MapboxGL.setAccessToken("pk.eyJ1Ijoicm9kcmljazE0IiwiYSI6ImNtMGFja295bzIwazQybnB3bXN2bzVka20ifQ.Hof7PLzBR1heGtearK6Jrg");

const MapScreen = () => {
  const { tienda, longitud, latitud } = useLocalSearchParams(); // Coordenadas del destino principal
  console.log("tienda:", tienda);
  console.log("longitud:", longitud);
  console.log("latitud:", latitud);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // Ubicación del usuario
  const [locations, setLocations] = useState<any[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationsAndRoute = async () => {
      try {
        setLoading(true);

        // Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permisos de Ubicación",
            "Por favor, activa los permisos de ubicación en la configuración."
          );
          return;
        }

        // Obtener ubicación del usuario
        const userLocationData = await Location.getCurrentPositionAsync({});
        const userCoords: [number, number] = [
          userLocationData.coords.longitude,
          userLocationData.coords.latitude,
        ];
        setUserLocation(userCoords);

        // Llamar al backend para obtener ubicaciones y ruta
        const response = await fetch(
          `${API_BASE_URL}/locations/?tienda=${tienda}&userLat=${userCoords[1]}&userLng=${userCoords[0]}&destLat=${longitud}&destLng=${latitud}`
        );

        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor.");
        }

        const data = await response.json();

        // Actualizar ubicaciones y ruta
        if (data.locations) {
          setLocations(data.locations);
        }
        if (data.route) {
          setRoute(data.route.route); // GeoJSON de la ruta
        }
      } catch (error) {
        console.error("Error al obtener locaciones y ruta:", error);
        Alert.alert("Error", "No se pudieron cargar las locaciones ni la ruta.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationsAndRoute();
  }, [tienda, longitud, latitud]);

  return (
    <View style={styles.container}>
    {loading && (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    )}
    {!loading && (
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          zoomLevel={12}
          centerCoordinate={userLocation || [0, 0]}
        />

        {userLocation && (
           <MapboxGL.UserLocation visible={true} />
        )}

        {route && (
          <MapboxGL.ShapeSource id="routeSource" shape={route}>
            <MapboxGL.LineLayer
              id="routeLayer"
              style={{
                lineColor: "orange",
                lineWidth: 8,
                lineCap: "round",
                lineJoin: "round",
                lineOpacity: 1,
                lineDasharray: [1, 1],
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {locations.map((location, index) => (
          <MapboxGL.PointAnnotation
            key={`location-${index}`}
            id={`location-${index}`}
            coordinate={[location.latitud, location.longitud]}
          >
            <MapboxGL.Callout title={location.nombre_tienda} >
              <View style={[styles.calloutContainer]}>
                <Text style={styles.calloutTitle}>{location.nombre_tienda}</Text>
                <Text style={styles.calloutText}>{location.direccion}</Text>
              </View>
            </MapboxGL.Callout>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  userMarker: {
    width: 30,
    height: 30,
    backgroundColor: "blue",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "black" },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { fontSize: 16, textAlign: "center" },
  markerContainer: { alignItems: "center" },
  markerImage: { width: 50, height: 50 },
  infoWindow: {
    position: "absolute",
    top: -60,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  markerText: {
    color: "white",
    fontSize: 12,
  },
  locationMarker: {
    width: 20,
    height: 20,
    backgroundColor: "red",
    borderRadius: 10,
  },
  infoTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 5 },
  infoText: { fontSize: 12 },
  calloutContainer: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    width: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 14,
  },
  calloutImage: {
    width: 50,
    height: 50,
  },
});

export default MapScreen;