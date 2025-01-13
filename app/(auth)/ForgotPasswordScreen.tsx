import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validateGoogleEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setEmailError('Please use a valid Gmail address');
      return false;
    }

    const localPart = email.split('@')[0].toLowerCase();
    
    if (
      localPart.length < 6 ||
      localPart.length > 30 ||
      localPart.startsWith('.') ||
      localPart.endsWith('.') ||
      localPart.includes('..') ||
      !/^[a-z0-9.]+$/.test(localPart)
    ) {
      setEmailError('Invalid Gmail username format');
      return false;
    }

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
    setResetSent(false);
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      if (!email) {
        setEmailError('Please enter your email address');
        return;
      }

      if (!validateGoogleEmail(email)) {
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      setEmailError('Failed to send reset email. Please try again.');
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
        
        <View style={styles.formContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FF5A1F" />
          </TouchableOpacity>

          <ThemedText type="body" style={styles.formTitle}>
            Reset Password
          </ThemedText>

          <ThemedText style={styles.instructions}>
            Enter your email address and we'll send you instructions to reset your password.
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
          </View>

          {resetSent && (
            <ThemedText style={styles.successText}>
              Password reset email has been sent. Please check your inbox.
            </ThemedText>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading || !!emailError}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Sending...' : 'Reset Password'}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Remember your password?{' '}
            </ThemedText>
            <Link href="/(auth)/welcome">
              <ThemedText style={styles.linkText}>
                Sign In
              </ThemedText>
            </Link>
          </View>
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
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: Dimensions.get('window').height * 0.2,
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 40,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
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
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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
});

export default ForgotPasswordScreen;