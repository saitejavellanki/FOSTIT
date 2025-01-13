import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

const OnboardingScreen = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/Fos_t-removebg-preview.png')}
          style={styles.logo}
        />
        
        <View style={styles.stepsContainer}>
          <StepItem
            number="1"
            title="Browse Restaurants"
            description="Explore a variety of restaurants and cuisines near you"
          />
          <StepItem
            number="2"
            title="Place Your Order"
            description="Select your favorite dishes and add them to cart"
          />
          <StepItem
            number="3"
            title="Fast Delivery"
            description="Track your order in real-time until it reaches you"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
        >
          <ThemedText style={styles.buttonText}>Get Started</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const StepItem = ({ number, title, description }: { 
  number: string; 
  title: string; 
  description: string; 
}) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <ThemedText style={styles.stepNumberText}>{number}</ThemedText>
    </View>
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>{title}</ThemedText>
      <ThemedText style={styles.stepDescription}>{description}</ThemedText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: 40,
  },
  stepsContainer: {
    width: '100%',
    gap: 24,
    marginVertical: 40,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FC8019',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#FC8019',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;