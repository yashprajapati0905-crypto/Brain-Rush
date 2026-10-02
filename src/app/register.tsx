
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

const API_URL = 'http://localhost:5000';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log('REGISTER BUTTON CLICKED');

    if (!name || !email || !password) {
      window.alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      console.log('Sending request to backend...');

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log('Backend response:', data);

      if (!response.ok) {
        window.alert(
          data.message || 'Registration failed'
        );
        return;
      }

      await AsyncStorage.setItem('token', data.token);

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      window.alert('Account created successfully! 🎉');

      router.replace('/');
    } catch (error) {
      console.error('REGISTER ERROR:', error);

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

      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Join Brain Rush
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

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
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Creating Account...'
            : 'CREATE ACCOUNT'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginText}>
          Already have an account? Login
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

  loginText: {
    color: '#818CF8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});

