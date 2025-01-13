import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface FooterProps {
  shopName?: string;
}

const Footer: React.FC<FooterProps> = ({
  shopName = '',
}) => {
  return (
    <View style={styles.container}>
      {/* Top divider */}
      <View style={styles.divider} />
      
      {/* Main footer content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <ThemedText style={styles.shopName}>{shopName}</ThemedText>
        </View>
        
        <View style={styles.buttonSection}>
          <View style={styles.fostContainer}>
            <ThemedText style={styles.fostText}>FOST</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '500',
  },
  buttonSection: {
    flexDirection: 'row',
  },
  fostContainer: {
    backgroundColor: '#ff9f43',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fostText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default Footer;