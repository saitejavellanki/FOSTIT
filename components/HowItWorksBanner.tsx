// HowItWorksBanner.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

interface HowItWorksBannerProps {
  onPress: () => void;
}

const HowItWorksBanner: React.FC<HowItWorksBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress}>
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="help-outline" size={20} color="#FC8019" />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.bannerTitle}>How It Works</ThemedText>
            <ThemedText style={styles.bannerSubtext}>Learn how to order in 4 easy steps</ThemedText>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#FFF0E6',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bannerSubtext: {
    fontSize: 12,
    color: '#666',
  },
});

export default HowItWorksBanner;

// HowItWorksScreen.tsx (previous implementation remains the same)
// ... (keep the previous HowItWorksScreen component code)