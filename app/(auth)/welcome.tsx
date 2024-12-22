import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firestore } from '../../components/firebase/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const auth = getAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const logoAnimation = new Animated.Value(-200); // Start from above screen
  const formAnimation = new Animated.Value(400); // Start from below screen
  const buttonAnimation = new Animated.Value(1);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.spring(logoAnimation, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(formAnimation, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Keyboard listeners
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const handleEmailSignIn = async () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setLoading(true);
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        if (isNewUser) {
          await firestore.collection('users').doc(userCredential.user.uid).set({
            email: userCredential.user.email,
            createdAt: new Date(),
          });
        }
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.error('Email sign in error:', error);
      Alert.alert('Error', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setLoading(true);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Google sign-in is only available on web platform');
        return;
      }

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      if (userCredential.user) {
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        if (isNewUser) {
          await firestore.collection('users').doc(userCredential.user.uid).set({
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            createdAt: new Date(),
          });
        }
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
      <LinearGradient
        colors={['#FC8019', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <Animated.View 
        style={[
          styles.header,
          {
            transform: [
              {
                translateY: logoAnimation,
              },
            ],
          },
        ]}
      >
        <Image 
          source={Platform.OS === 'web' 
            ? { uri: '/api/placeholder/120/120' }
            : require('../../assets/images/1.png')}
          style={styles.logo}
        />
        <ThemedText type="title" style={styles.title}>
          FOST
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to continue ordering your favorite food
        </ThemedText>
      </Animated.View>

      <Animated.View 
        style={[
          styles.authContainer,
          {
            transform: [
              {
                translateY: formAnimation,
              },
            ],
          },
        ]}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
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

          <Animated.View style={{ transform: [{ scale: buttonAnimation }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              <MaterialIcons name="email" size={24} color="#fff" />
              <ThemedText style={styles.buttonText}>
                Sign in with Email
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
          
          {Platform.OS === 'web' && (
            <Animated.View style={{ transform: [{ scale: buttonAnimation }] }}>
              <TouchableOpacity
                style={[styles.googleButton, loading && styles.disabledButton]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <MaterialIcons name="google" size={24} color="#fff" />
                <ThemedText style={styles.buttonText}>
                  Sign in with Google
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {!isKeyboardVisible && (
        <ThemedText style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 60,
    backgroundColor: '#fff',
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
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FC8019',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  authContainer: {
    paddingHorizontal: 24,
    width: '100%',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC8019',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
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
    opacity: 0.6,
  },
  terms: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default WelcomeScreen;