import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { 
  createUserWithEmailAndPassword, 
  getAuth,
  AuthError,
  UserCredential 
} from 'firebase/auth';

// Type definitions
interface SignupProps {}

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Signup: React.FC<SignupProps> = () => {
  // State management
  const [formData, setFormData] = useState<FormState>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required';
    }
    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input handlers
  const handleInputChange = useCallback((name: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  // Sign up handler
  const handleEmailSignIn = async (): Promise<void> => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (userCredential.user) {
        Alert.alert('Success', 'Account created successfully!');
        // Additional success handling (e.g., navigation) can be added here
      }
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An error occurred during sign up';
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          setErrors(prev => ({ ...prev, email: errorMessage }));
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          setErrors(prev => ({ ...prev, email: errorMessage }));
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          setErrors(prev => ({ ...prev, password: errorMessage }));
          break;
        default:
          console.error('Sign up error:', authError);
      }
      
      Alert.alert('Error', errorMessage);
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
            Create your account
          </ThemedText>

          <ThemedText style={styles.gmailNote}>
            🌟 Use your existing Gmail account to unlock premium features and enhance your experience!
          </ThemedText>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#FF5A1F" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {errors.email && (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            )}

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#FF5A1F" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                editable={!loading}
              />
            </View>
            {errors.password && (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleEmailSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign Up Now</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/welcome">
              <ThemedText style={styles.linkText}>Sign In</ThemedText>
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
  gmailNote: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    color: '#FF5A1F',
    textAlign: 'center',
    fontSize: 14,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
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
    fontSize: 16,
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
  button: {
    backgroundColor: '#FF5A1F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF5A1F',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
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

export default Signup;