import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const heights = Dimensions.get('screen').height;

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateGoogleEmail = (email: string): boolean => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Check if it's a Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setEmailError('Please use a valid Gmail address');
      return false;
    }

    // Additional Gmail-specific validation
    const localPart = email.split('@')[0].toLowerCase();
    
    // Gmail username rules:
    // - Must be between 6-30 characters
    // - Can contain letters, numbers, dots
    // - Cannot start or end with a dot
    // - Cannot have consecutive dots
    // if (
    //   localPart.length < 6 ||
    //   localPart.length > 30 ||
    //   localPart.startsWith('.') ||
    //   localPart.endsWith('.') ||
    //   localPart.includes('..') ||
   
    // ) {
    //   setEmailError('Invalid Gmail username format');
    //   return false;
    // }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text) {
      validateGoogleEmail(text);
    } else {
      setEmailError('');
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      // Validate email before proceeding
      if (!validateGoogleEmail(email)) {
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify({email, password}));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      console.error('Email sign in error:', error);
      Alert.alert('Error', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Google sign-in is only available on web platform');
        return;
      }

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      if (userCredential.user) {
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#FF5A1F', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/Fos_t-removebg-preview.png')} 
            style={styles.logoImage}
          />
        </View>

        <View style={styles.formContainer}>
          <ThemedText type="body" style={styles.formTitle}>
            Sign in to your account
          </ThemedText>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#FF5A1F" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {emailError ? (
              <ThemedText style={styles.errorText}>
                {emailError}
              </ThemedText>
            ) : null}

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#FF5A1F" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
            <View style={styles.forgotPasswordContainer}>
  <Link href="/(auth)/ForgotPasswordScreen">
    <ThemedText style={styles.forgotPasswordText}>
      Forgot password?
    </ThemedText>
  </Link>
</View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleEmailSignIn}
            disabled={loading || !!emailError}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>

          {/* {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <MaterialIcons name="google" size={24} color="#fff" />
              <ThemedText style={styles.buttonText}>
                Continue with Google
              </ThemedText>
            </TouchableOpacity>
          )} */}

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              New to Fost?{' '}
            </ThemedText>
            <Link href="/(auth)/signup">
              <ThemedText style={styles.linkText}>
                Create Account
              </ThemedText>
            </Link>
          </View>

          

          <ThemedText style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Dimensions.get('window').height * 0.4,
    opacity: 0.9,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#FF5A1F',
    fontSize: 14,
    fontWeight: '500',
  },
  logoImage: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#FF5A1F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF5A1F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#FF5A1F',
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    marginTop: 24,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
});

export default WelcomeScreen;