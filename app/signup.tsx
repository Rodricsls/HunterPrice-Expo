import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
/* import Auth from '@/components/Auth'; */
import API_BASE_URL from '@/constants/api';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  //Handle the register action
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!name || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/SignUp`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nombre: name,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.status === 201) {
        Alert.alert('Éxito', '¡Registro exitoso! Verifica tu correo.');
        router.push('/landing');
      } else {
        Alert.alert('Error', data.error || 'Algo salió mal');
      }
    } catch (err: unknown) {
      setLoading(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Error interno del servidor');
    }
  };
  return (
    <View style={styles.container}>
      {/* Global Loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image source={require('../assets/brand/HunterBlack.png')} style={styles.logo} alt="Logo" />
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Confirmar Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!name || !email || !password || !confirmPassword) && styles.disabledButton,
          ]}
          onPress={handleRegister}
          disabled={!name || !email || !password || !confirmPassword || loading}
        >
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Text style={styles.divider}>o</Text>

        {/* Google Login Button */}
        {/* <Auth /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252376',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: '#D5D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: height * 0.1,
  },
  formContainer: {
    width: width * 0.8,
    backgroundColor: '#D5D5DD',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    paddingVertical: 40,
  },
  input: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  registerButton: {
    width: '90%',
    backgroundColor: '#252376',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    color: '#252376',
    fontSize: 16,
    marginVertical: 10,
  },
  label: {
    width: '90%',
    alignSelf: 'center',
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
  },
});
