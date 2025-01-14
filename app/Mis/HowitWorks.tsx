import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const HowItWorksScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      title: 'Select & Order',
      description: 'Browse multiple stalls and create your perfect meal combination',
      icon: 'restaurant-menu',
      placeholder: '/api/placeholder/320/180',
      color: '#FF6B6B',
      features: ['Multiple cuisines', 'Real-time availability', 'Easy customization']
    },
    {
      title: 'Payment',
      description: 'Quick and secure payment with multiple options',
      icon: 'payments',
      placeholder: '/api/placeholder/320/180',
      color: '#4ECDC4',
      features: ['Multiple payment methods', 'Secure transactions', 'Order confirmation']
    },
    {
      title: 'Preparation',
      description: 'Track your order status in real-time',
      icon: 'outdoor-grill',
      placeholder: '/api/placeholder/320/180',
      color: '#45B7D1',
      features: ['Live status updates', 'Preparation time', 'Ready notifications']
    },
    {
      title: 'Pickup',
      description: 'Scan QR code and collect your order',
      icon: 'qr-code-scanner',
      placeholder: '/api/placeholder/320/180',
      color: '#96CEB4',
      features: ['QR verification', 'Express pickup', 'Digital receipt']
    }
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Gradient Background Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>How It Works</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Modern Food Court Experience</ThemedText>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.timeline}>
          {steps.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              {/* Connector Line */}
              {index > 0 && (
                <View style={[styles.connector, { backgroundColor: step.color }]} />
              )}
              
              {/* Step Number */}
              <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
              </View>

              {/* Content Card */}
              <View style={styles.contentCard}>
                {/* Header */}
                <View style={[styles.cardHeader, { backgroundColor: step.color }]}>
                  <MaterialIcons name={step.icon} size={24} color="#fff" />
                  <ThemedText style={styles.cardTitle}>{step.title}</ThemedText>
                </View>

                {/* Image */}
                <Image
                  source={{ uri: step.placeholder }}
                  style={styles.stepImage}
                  resizeMode="cover"
                />

                {/* Description */}
                <View style={styles.cardContent}>
                  <ThemedText style={styles.description}>
                    {step.description}
                  </ThemedText>

                  {/* Features */}
                  <View style={styles.features}>
                    {step.features.map((feature, fIndex) => (
                      <View key={fIndex} style={styles.featureItem}>
                        <MaterialIcons name="check-circle" size={16} color={step.color} />
                        <ThemedText style={styles.featureText}>{feature}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/')}
        >
          <ThemedText style={styles.startButtonText}>Start Your Order</ThemedText>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#FC8019',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  timeline: {
    paddingTop: 16,
  },
  timelineItem: {
    marginBottom: 32,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 24,
    top: -32,
    width: 2,
    height: 40,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  features: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#FC8019',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HowItWorksScreen;