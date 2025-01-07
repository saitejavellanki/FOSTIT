import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
  Image,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '@/components/firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
  id: string;
  imageUrl: string;
}

interface Order {
  id: string;
  status: string;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  customerEmail: string;
  customerId: string;
  confirmedAt: Date;
  shopId: string;
}

const getUserLevel = (totalOrders: number) => {
  if (totalOrders >= 50) return { 
    level: 'Diamond', 
    color: '#B9F2FF',
    icon: 'diamond',
    progress: 100,
    nextLevel: null,
    ordersToNext: 0
  };
  if (totalOrders >= 30) return { 
    level: 'Platinum', 
    color: '#E5E4E2',
    icon: 'star',
    progress: ((totalOrders - 30) / 20) * 100,
    nextLevel: 'Diamond',
    ordersToNext: 50 - totalOrders
  };
  if (totalOrders >= 20) return { 
    level: 'Gold', 
    color: '#FFD700',
    icon: 'trophy',
    progress: ((totalOrders - 20) / 10) * 100,
    nextLevel: 'Platinum',
    ordersToNext: 30 - totalOrders
  };
  if (totalOrders >= 10) return { 
    level: 'Silver', 
    color: '#C0C0C0',
    icon: 'medal',
    progress: ((totalOrders - 10) / 10) * 100,
    nextLevel: 'Gold',
    ordersToNext: 20 - totalOrders
  };
  return { 
    level: 'Bronze', 
    color: '#CD7F32',
    icon: 'shield',
    progress: (totalOrders / 10) * 100,
    nextLevel: 'Silver',
    ordersToNext: 10 - totalOrders
  };
};
const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [ongoingOrders, setOngoingOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const user = auth.currentUser;

  const isDarkMode = colorScheme === 'dark';
  const backgroundColor = isDarkMode ? '#1c1c1c' : '#f8f8f8';
  const textColor = isDarkMode ? '#ffffff' : '#333333';
  const cardBackground = isDarkMode ? '#2c2c2c' : '#ffffff';
  const borderColor = isDarkMode ? '#3c3c3c' : '#f0f0f0';

  const fetchOrders = async () => {
    console.log('🔄 Fetching orders for user:', user?.email);
    if (!user) {
      console.log('❌ No user found, aborting fetch');
      return;
    }

    const ordersRef = collection(firestore, 'orders');
    
    try {
      console.log('📊 Creating queries for ongoing and completed orders');
      const ongoingQuery = query(
        ordersRef,
        where('customerEmail', '==', user.email),
        where('status', '!=', 'completed'),
        orderBy('createdAt', 'desc')
      );

      const historyQuery = query(
        ordersRef,
        where('customerEmail', '==', user.email),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
      );

      console.log('🚀 Executing Firebase queries');
      const ongoingSnapshot = await getDocs(ongoingQuery);
      const historySnapshot = await getDocs(historyQuery);

      const ongoingOrdersData = ongoingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        confirmedAt: doc.data().confirmedAt?.toDate() || new Date(),
      })) as Order[];

      const historyOrdersData = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        confirmedAt: doc.data().confirmedAt?.toDate() || new Date(),
      })) as Order[];

      console.log(`✅ Fetched ${ongoingOrdersData.length} ongoing orders and ${historyOrdersData.length} completed orders`);
      
      setOngoingOrders(ongoingOrdersData);
      setOrderHistory(historyOrdersData);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      default:
        return '#FC8019';
    }
  };

  const renderOrderCard = (order: Order) => (
    <View 
      key={order.id} 
      style={[
        styles.orderCard,
        { backgroundColor: cardBackground, borderColor: borderColor }
      ]}
    >
      <View style={styles.orderHeader}>
        <ThemedText type="defaultSemiBold" style={[styles.restaurantName, { color: textColor }]}>
          {order.shopName}
        </ThemedText>
        <ThemedText style={styles.orderDate}>
          {formatDate(order.createdAt)}
        </ThemedText>
      </View>
      
      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <ThemedText key={index} style={styles.orderItem}>
            {item.quantity}x {item.name}
          </ThemedText>
        ))}
      </View>
      
      <View style={[styles.orderFooter, { borderTopColor: borderColor }]}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={order.status === 'completed' ? 'checkmark-circle' : 'time'} 
            size={16} 
            color={getStatusColor(order.status)}
          />
          <ThemedText style={[
            styles.statusText,
            { color: getStatusColor(order.status) }
          ]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.totalAmount, { color: textColor }]}>
          ₹{order.totalAmount.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FC8019' }]}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 }
          ]}
        >
          <View style={styles.header}>
          <View style={styles.profileSection}>
  {user?.photoURL ? (
    <Image 
      source={{ uri: user.photoURL }} 
      style={styles.profileImage}
    />
  ) : (
    <View style={styles.avatarContainer}>
      <Ionicons name="person-circle" size={80} color="#fff" />
    </View>
  )}
  <ThemedText style={styles.email}>{user?.email}</ThemedText>
  
  {/* Add this new enhanced level container */}
  

  <TouchableOpacity 
    style={styles.signOutButton}
    onPress={handleSignOut}
  >
    <Ionicons name="log-out-outline" size={20} color="#fff" />
    <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
  </TouchableOpacity>
</View>
          </View>
          <View style={styles.levelContainer}>
    <View style={styles.levelHeader}>
      <View style={styles.levelIcon}>
        <Ionicons 
          name={getUserLevel(ongoingOrders.length + orderHistory.length).icon} 
          size={24} 
          color={getUserLevel(ongoingOrders.length + orderHistory.length).color} 
        />
      </View>
      <ThemedText style={styles.levelTitle}>
        {getUserLevel(ongoingOrders.length + orderHistory.length).level}
      </ThemedText>
    </View>
    
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            {
              width: `${getUserLevel(ongoingOrders.length + orderHistory.length).progress}%`,
              backgroundColor: getUserLevel(ongoingOrders.length + orderHistory.length).color
            }
          ]} 
        />
      </View>
      {getUserLevel(ongoingOrders.length + orderHistory.length).nextLevel && (
        <ThemedText style={styles.progressText}>
          {getUserLevel(ongoingOrders.length + orderHistory.length).ordersToNext} orders until {getUserLevel(ongoingOrders.length + orderHistory.length).nextLevel}
        </ThemedText>
      )}
    </View>
    
    <ThemedText style={styles.totalOrdersText}>
      Total Orders: {ongoingOrders.length + orderHistory.length}
    </ThemedText>
  </View>
          <View style={styles.content}>
            {ongoingOrders.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                  Ongoing Orders
                </ThemedText>
                {ongoingOrders.map(renderOrderCard)}
              </View>
            )}

            <View style={styles.section}>
              
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                Order History
              </ThemedText>
              {orderHistory.length > 0 ? (
                orderHistory.map(renderOrderCard)
              ) : (
                <ThemedText style={styles.emptyText}>
                  No order history available
                </ThemedText>
              )}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FC8019',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  email: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333333', // Dark text for light mode
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#555555', // Darker gray for better visibility
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#444444', // Darker gray for better visibility
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#555555', // Darker gray for better visibility
    fontSize: 16,
    paddingVertical: 24,
  },
  levelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker background for better contrast
    padding: 16,
    borderRadius: 20,
    width: '90%',
    alignSelf: 'center',
    marginTop: -30, // Overlap with header
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelIcon: {
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 12,
  },
  levelTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  totalOrdersText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});

export default ProfileScreen;