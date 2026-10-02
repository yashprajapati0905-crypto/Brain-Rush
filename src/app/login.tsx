
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const API_URL = 'https://brain-rush-backend.onrender.com';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('LOGIN BUTTON CLICKED');

    if (!email || !password) {
      window.alert('Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log('Login response:', data);

      if (!response.ok) {
        window.alert(
          data.message || 'Login failed'
        );
        return;
      }

      // Save JWT token
      await AsyncStorage.setItem(
        'token',
        data.token
      );

      // Save user data
      await AsyncStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      window.alert('Login successful! 🎉');

      router.replace('/');
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      window.alert(
        'Cannot connect to Brain Rush server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧠</Text>

      <Text style={styles.title}>
        Welcome Back
      </Text>

      <Text style={styles.subtitle}>
        Login to Brain Rush
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'LOGIN'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/register')}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    padding: 25,
    justifyContent: 'center',
  },

  logo: {
    fontSize: 55,
    textAlign: 'center',
    marginBottom: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 30,
  },

  input: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#4F46E5',
    padding: 17,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerText: {
    color: '#818CF8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});

