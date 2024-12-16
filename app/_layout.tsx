import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import * as SecureStore from 'expo-secure-store';

export default function Layout() {
  const router = useRouter();

  // Verifica si hay un token almacenado al cargar el layout
  useEffect(() => {
    const checkUserToken = async () => {
      const userToken = await SecureStore.getItemAsync('user_token');

      if (userToken) {
        console.log('Token encontrado:', userToken);
        // Navega directamente a home si hay un token almacenado
        router.replace('/(tabs)/home');
      } else {
        console.log('No se encontró token, esperando cambios en auth state');
        // Escucha cambios en el estado de autenticación
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event);

          if (session || event === 'SIGNED_IN') {
            // Si hay una sesión activa o un inicio de sesión, guarda el token
            if (session?.access_token) {
              SecureStore.setItemAsync('user_token', session.access_token);
            }
            router.replace('/home');
          } else {
            router.replace('/landing');
          }
        });

        // Limpia el listener cuando se desmonta el componente
        return () => {
          data.subscription.unsubscribe();
        };
      }
    };

    checkUserToken();
  }, []); // Este efecto solo se ejecuta al montar el componente

  console.log('Ruta actual:', usePathname());

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta encabezado globalmente
      }}
    >
      <Stack.Screen
        name="landing"
        options={{
          animation: 'fade', // Transición suave para landing
          gestureEnabled: false, // Deshabilita gesto de swipe para regresar
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          animation: 'slide_from_right', // Transición de deslizamiento
          gestureEnabled: false, // Deshabilita gesto de swipe para regresar
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: 'slide_from_left', // Transición de deslizamiento hacia la izquierda
          gestureEnabled: true, // Permite swipe si es necesario
        }}
      />
    </Stack>
  );
}
