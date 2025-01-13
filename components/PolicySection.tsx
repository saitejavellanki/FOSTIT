import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

type PolicyItemType = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  url: string;
};

const POLICY_ITEMS: PolicyItemType[] = [
  {
    icon: 'refresh-circle-outline',
    title: 'Privacy Policy',
    url: 'https://main.d15io2iwu35boj.amplifyapp.com/privacypolicy'
  },
  {
    icon: 'close-circle-outline',
    title: 'Cancellation Policy',
    url: 'https://main.d15io2iwu35boj.amplifyapp.com/refund'
  },
  {
    icon: 'document-text-outline',
    title: 'Terms & Conditions',
    url: 'https://main.d15io2iwu35boj.amplifyapp.com/termsandconditions'
  },
  {
    icon: 'information-circle-outline',
    title: 'How it Works',
    url: 'https://main.d15io2iwu35boj.amplifyapp.com/howitworks'
  },
  {
    icon: 'people-outline',
    title: 'About Us',
    url: 'https://main.d15io2iwu35boj.amplifyapp.com/aboutus'
  }
];

const PolicySection = ({ icon, title, url }: {
  icon: PolicyItemType['icon'];
  title: string;
  url: string;
}) => {
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening URL: ${error}`);
    }
  };

  return (
    <TouchableOpacity style={styles.policyCard} onPress={handlePress}>
      <View style={styles.policyIconContainer}>
        <Ionicons name={icon} size={24} color="#FF8C37" />
      </View>
      <View style={styles.policyContent}>
        <ThemedText style={styles.policyTitle}>{title}</ThemedText>
        <Ionicons name="chevron-forward" size={20} color="#FFA664" />
      </View>
    </TouchableOpacity>
  );
};

export const PolicySections = () => {
  return (
    <View style={styles.container}>
      <View style={styles.policiesSection}>
        <ThemedText style={styles.sectionTitle}>Help & Policies</ThemedText>
        
        {POLICY_ITEMS.map((item, index) => (
          <PolicySection
            key={index}
            icon={item.icon}
            title={item.title}
            url={item.url}
          />
        ))}
      </View>
      <View style={styles.bottomSafeArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  policiesSection: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  bottomSafeArea: {
    height: 80, // This provides space for the tab bar
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF8C37',
    marginBottom: 16
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FF8C37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE5DC'
  },
  policyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  policyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  policyTitle: {
    fontSize: 16,
    color: '#1C1C1C',
    fontWeight: '500'
  }
});

export default PolicySections;