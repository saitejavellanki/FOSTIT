import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HowItWorksScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      title: 'Select & Order',
      description: 'Browse multiple stalls and create your perfect meal combination',
      icon: 'restaurant-menu',
      features: ['Multiple cuisines', 'Real-time availability', 'Easy customization']
    },
    {
      title: 'Payment',
      description: 'Quick and secure payment with multiple options',
      icon: 'payments',
      features: ['Multiple payment methods', 'Secure transactions', 'Order confirmation']
    },
    {
      title: 'Preparation',
      description: 'Track your order status in real-time',
      icon: 'outdoor-grill',
      features: ['Live status updates', 'Preparation time', 'Ready notifications']
    },
    {
      title: 'Pickup',
      description: 'Scan QR code and collect your order',
      icon: 'qr-code-scanner',
      features: ['QR verification', 'Express pickup', 'Digital receipt']
    }
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#404145" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>How It Works</ThemedText>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={step.icon} size={24} color="#404145" />
              </View>
              <View style={styles.stepNumberContainer}>
                <ThemedText style={styles.stepNumber}>{index + 1}</ThemedText>
              </View>
            </View>
            
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
              <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
              
              <View style={styles.features}>
                {step.features.map((feature, fIndex) => (
                  <View key={fIndex} style={styles.featureItem}>
                    <MaterialIcons name="check" size={16} color="#1dbf73" />
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/')}
        >
          <ThemedText style={styles.startButtonText}>Start Ordering</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e5e7',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#404145',
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    marginBottom: 40,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FC8019',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    paddingLeft: 60,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#404145',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#62646a',
    marginBottom: 16,
    lineHeight: 24,
  },
  features: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#404145',
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: '#FC8019',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HowItWorksScreen;