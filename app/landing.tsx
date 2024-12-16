import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';



const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/brand/BlackLogo.png')} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/signup')}>
            <Text style={styles.signupText}>Registrarme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF', // White background
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    flex: 2, // Adjust to control logo height
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7, // 60% of the screen width
    height: height * 0.3, // 30% of the screen height
  },
  buttonsContainer: {
    flex: 1, // Adjust to control button section height
    width: '80%',

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#D5D5DD',
    borderRadius: 12,
  },
  loginButton: {
    width: width * 0.6, // 80% of the screen width
    paddingVertical: 15,
    backgroundColor: '#252376', // Dark blue color
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily:'Ubuntu',
  },
  signupButton: {
    width: width * 0.6, // 80% of the screen width
    paddingVertical: 15,
    backgroundColor: '#F3F3F3', // Light grey color
    borderRadius: 12,
    alignItems: 'center',
  },
  signupText: {
    color: '#252376', // Same blue color as the login button
    fontSize: 18,
    fontWeight: 'bold',
  },
});
