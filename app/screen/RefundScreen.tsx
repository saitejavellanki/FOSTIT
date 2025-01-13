import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const PolicySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </View>
);

const RefundScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cancellation & Refund Policy</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <PolicySection title="1. Order Cancellation">
            <ThemedText style={styles.description}>
              FOST's cancellation policy is designed to ensure fair practices for both customers and food stalls:
            </ThemedText>
            <BulletPoint text="Orders can be cancelled before preparation begins" />
            <BulletPoint text="No cancellations once food preparation starts" />
            <BulletPoint text="Unique QR code tracking for order status" />
          </PolicySection>

          <PolicySection title="2. Refund Conditions">
            <ThemedText style={styles.description}>
              Refunds are processed under specific circumstances:
            </ThemedText>
            <BulletPoint text="Full refund if order is cancelled before preparation" />
            <BulletPoint text="Partial refund for verified stall errors" />
            <BulletPoint text="No refunds for user-initiated cancellations after preparation" />
            <BulletPoint text="Payment processed through secure PayU gateway" />
          </PolicySection>

          <PolicySection title="3. Order Pickup Timeline">
            <ThemedText style={styles.description}>
              Critical pickup conditions:
            </ThemedText>
            <BulletPoint text="Maximum waiting time: 45 minutes from order preparation" />
            <BulletPoint text="Order considered abandoned if not picked up within 45 minutes" />
            <BulletPoint text="No refund for uncollected orders" />
            <BulletPoint text="Stall reserves right to resell or dispose of unclaimed orders" />
          </PolicySection>

          <PolicySection title="4. Payment Processing">
            <ThemedText style={styles.description}>
              Payment and transaction details:
            </ThemedText>
            <BulletPoint text="Integrated with secure PayU payment gateway" />
            <BulletPoint text="Instant transaction verification" />
            <BulletPoint text="Multiple payment methods supported" />
            <BulletPoint text="Transparent fee structure" />
          </PolicySection>

          <PolicySection title="5. Technical Failures">
            <ThemedText style={styles.description}>
              Handling of technical interruptions:
            </ThemedText>
            <BulletPoint text="Compensation for verified system errors" />
            <BulletPoint text="24-hour customer support for transaction issues" />
            <BulletPoint text="Comprehensive transaction logs" />
            <BulletPoint text="Prompt resolution of payment discrepancies" />
          </PolicySection>

          <PolicySection title="6. User Responsibilities">
            <ThemedText style={styles.description}>
              Customer obligations:
            </ThemedText>
            <BulletPoint text="Provide accurate contact and pickup information" />
            <BulletPoint text="Collect order within designated time frame" />
            <BulletPoint text="Verify order details at pickup" />
            <BulletPoint text="Maintain QR code integrity" />
          </PolicySection>

          <PolicySection title="7. Dispute Resolution">
            <ThemedText style={styles.description}>
              Conflict management process:
            </ThemedText>
            <BulletPoint text="Dedicated customer support team" />
            <BulletPoint text="Transparent escalation mechanism" />
            <BulletPoint text="Mediation for unresolved disputes" />
            <BulletPoint text="Fair and timely resolution approach" />
          </PolicySection>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              All policies subject to change. Users will be notified of significant updates.
            </ThemedText>
            <ThemedText style={styles.lastUpdated}>
              Last Updated: November 2024
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB700'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    textAlign: 'center',
    flex: 1
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE5CC'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 12
  },
  sectionContent: {
    marginLeft: 8
  },
  description: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 20
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 8
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8500',
    marginRight: 8,
    marginTop: 1
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    lineHeight: 20
  },
  footer: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF5E6',
    borderRadius: 12
  },
  footerText: {
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8
  },
  lastUpdated: {
    fontSize: 12,
    color: '#FF6B00',
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default RefundScreen;