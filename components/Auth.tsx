/* import {
    GoogleSignin,
    statusCodes,
  } from '@react-native-google-signin/google-signin'
  import { supabase } from '../lib/supabaseClient' 
  import { StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router'

const { width } = Dimensions.get('window'); 
  export default function Auth() {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: '979236576776-k7juvhe5n39eloc7p1t10dksj8pepdl4.apps.googleusercontent.com',
    })

    const handleGoogleSignIn = async () => {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signOut(); // Asegura que no haya sesiones previas activas
        const userInfo = await GoogleSignin.signIn();
        if (userInfo && userInfo.data?.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.data?.idToken,
          })
          console.log(error, data)

          if (data.user) {
            const { error: insertError } = await supabase.from('usuarios').insert([
              {
                uuid: data.user.id, // ID único del usuario proporcionado por Supabase
                nombre: userInfo.data?.user.name, // Nombre del usuario desde Google
                created: new Date().toISOString(),
              },
            ]);
          }
          
        } else {
          throw new Error('no ID token present!')
        }
      } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // user cancelled the login flow
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // operation (e.g. sign in) is in progress already
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // play services not available or outdated
        } else {
          // some other error happened
        }
      }finally{
        router.replace('/splash/splash')
      }
    }  
    return (
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>
    )
}



const styles = StyleSheet.create({
  googleButton: {
    width: '90%',
    backgroundColor: '#252376',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  googleButtonText: {
    color: '#FFFFFF', // Texto blanco
    fontSize: 16,
    fontWeight: 'bold',
  },
});

   */