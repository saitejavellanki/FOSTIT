import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { firestore, getCurrentUser } from '../../components/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface OrderItem {
  name: string;
  quantity: number;
  shopName: string;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: any;
  shopName?: string;
}

export const ActiveOrdersSection: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser?.email) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const ordersRef = collection(firestore, 'orders');
        const activeOrdersQuery = query(
          ordersRef,
          where('customerEmail', '==', currentUser.email),
          where('status', 'in', ['pending', 'processing', 'completed'])
        );

        const unsubscribe = onSnapshot(activeOrdersQuery, 
          (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Order[];
            setActiveOrders(orders);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Active Orders</ThemedText>
      
      {loading && (
        <View style={styles.messageContainer}>
          <ThemedText>Loading orders...</ThemedText>
        </View>
      )}

      {error && (
        <View style={styles.messageContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </View>
      )}

      {!loading && !error && activeOrders.length === 0 && (
        <View style={styles.messageContainer}>
          <ThemedText style={{color:'white'}}>No active orders</ThemedText>
        </View>
      )}

      {activeOrders.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.ordersScroll}
        >
          {activeOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push({
                pathname: '/Mis/orderwaiting',
                params: { orderId: order.id }
              })}
            >
              <View style={styles.orderHeader}>
                <MaterialIcons name="store" size={20} color="#4b5563" />
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <ThemedText style={styles.statusText}>
                    {order.status}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.shopName}>
                {order.items[0]?.shopName || 'Shop'}
              </ThemedText>

              <View style={styles.footer}>
                <ThemedText style={styles.orderInfo}>
                  {order.items.length} items • ₹{order.totalAmount.toFixed(2)}
                </ThemedText>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#fc8019',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color:'#ffffff'
  },
  messageContainer: {
    padding: 16,
    alignItems: 'center',
    color:"#ffffff"
  },
  errorText: {
    color: '#ff4d4d',
  },
  ordersScroll: {
    paddingLeft: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
});