import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  Modal,
  BackHandler,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { firestore } from '../../components/firebase/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import PreviousOrders from './PreviousOrders';
import Ads from '@/components/Ads';

const { width } = Dimensions.get('window');

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  status: string;
  items: OrderItem[];
  totalAmount: number;
  tax?: number;
  createdAt: any;
  pickedUp?: boolean;
}

const OrderWaitingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [isReadyForPickup, setIsReadyForPickup] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPickedUp, setIsPickedUp] = useState(false);

  const { orderId } = useLocalSearchParams();

  const handleBackPress = () => {
    router.back();
  };

  useEffect(() => {
    const backAction = () => {
      if (isQRModalVisible) {
        setIsQRModalVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isQRModalVisible]);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }

    const orderRef = doc(firestore, 'orders', orderId as string);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as OrderDetails;
          setOrderStatus(data.status);
          setIsReadyForPickup(data.status === 'completed');
          setIsCancelled(data.status === 'cancelled');
          
          if (data.pickedUp || data.status === 'picked_up') {
            setIsQRModalVisible(false);
            setIsPickedUp(true);
            setTimeout(() => router.replace('/'), 2000);
          }
          
          setOrderDetails(data);
        } else {
          Alert.alert('Error', 'Order not found');
          router.replace('/');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching order:', error);
        Alert.alert('Error', 'Failed to fetch order details');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const handleQRScanned = async () => {
    if (!orderId) return;

    try {
      setIsQRModalVisible(false);
      
      const orderRef = doc(firestore, 'orders', orderId as string);
      await updateDoc(orderRef, {
        pickedUp: true,
        status: 'picked_up'
      });
    } catch (error) {
      console.error('Error updating order pickup status:', error);
      Alert.alert('Error', 'Failed to update order pickup status');
    }
  };

  const getStatusInfo = () => {
    const statusConfigs = {
      picked_up: {
        icon: 'check-circle',
        color: '#48c479',
        title: 'Order Picked Up',
        message: 'Your order has been successfully picked up',
        progress: 100
      },
      cancelled: {
        icon: 'cancel',
        color: '#ff4d4d',
        title: 'Order Cancelled',
        message: 'Unfortunately, this order has been cancelled',
        progress: 0
      },
      pending: {
        icon: 'schedule',
        color: '#6366f1',
        title: 'Order Accepted',
        message: 'Your order has been received and is being reviewed',
        progress: 30
      },
      processing: {
        icon: 'shopping-bag',
        color: '#6366f1',
        title: 'Order Being Prepared',
        message: 'Your order is currently being prepared',
        progress: 70
      },
      completed: {
        icon: 'check-circle',
        color: '#48c479',
        title: 'Ready for Pickup',
        message: 'Your order is ready to collect',
        progress: 100
      }
    };

    if (isPickedUp) return statusConfigs.picked_up;
    if (isCancelled) return statusConfigs.cancelled;
    return statusConfigs[orderStatus as keyof typeof statusConfigs] || {
      icon: 'info',
      color: '#6366f1',
      title: 'Processing Order',
      message: 'Your order is being processed',
      progress: 50
    };
  };

  const renderOrderItems = () => {
    if (!orderDetails?.items) return null;
  
    return orderDetails.items.map((item, index) => (
      <View key={index} style={styles.orderItem}>
        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <ThemedText style={styles.itemQuantity}>x{item.quantity}</ThemedText>
        </View>
        <ThemedText style={styles.itemPrice}>
          ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </ThemedText>
      </View>
    ));
  };

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </ThemedView>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 10 }]} 
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        <Image 
          source={require('../../assets/images/Fos_t-removebg-preview.png')}  // Update this path to match your logo location
          style={[styles.logo, { top: insets.top + 10 }]}
          resizeMode="contain"
        />
        </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? 50 : 0 }
        ]}
      >
        <View style={styles.statusCard}>
          <MaterialIcons name={statusInfo.icon as any} size={48} color={statusInfo.color} />
          <ThemedText style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </ThemedText>
          <ThemedText style={styles.statusMessage}>{statusInfo.message}</ThemedText>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${statusInfo.progress}%`, backgroundColor: statusInfo.color }
              ]} 
            />
          </View>
          
        </View>

        {orderDetails && (
          <View style={styles.orderDetailsCard}>
            <ThemedText style={styles.sectionTitle}>Order Details</ThemedText>
            {renderOrderItems()}
            
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>Subtotal</ThemedText>
                <ThemedText style={styles.totalValue}>
                  ₹{orderDetails.totalAmount.toFixed(2)}
                </ThemedText>
              </View>
              {orderDetails.tax && (
                <View style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>Tax</ThemedText>
                  <ThemedText style={styles.totalValue}>
                    ₹{orderDetails.tax.toFixed(2)}
                  </ThemedText>
                </View>
              )}
              <View style={[styles.totalRow, styles.finalTotal]}>
                <ThemedText style={styles.finalTotalText}>Total</ThemedText>
                <ThemedText style={styles.finalTotalAmount}>
                  ₹{((orderDetails.totalAmount) + (orderDetails.tax || 0)).toFixed(2)}
                </ThemedText>
              </View>
              
            </View>
            <View>
            
          </View>
          
          </View>
          
          
          
        )}
        <Ads/>
        
            <PreviousOrders/>
          
      </ScrollView>

      {isReadyForPickup && !isPickedUp && (
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setIsQRModalVisible(true)}
          >
            <ThemedText style={styles.qrButtonText}>Show QR Code</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isQRModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQRModalVisible(false)}
      >
        <BlurView intensity={90} style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Order QR Code</ThemedText>
            <View style={styles.qrContainer}>
              <QRCode
                value={`order-pickup:${orderId}`}
                size={200}
                onError={(error) => console.error('QR Code Error:', error)}
              />
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsQRModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  
  logo: {
    width: 100, // Increased from 100
    height: 45,
    position: 'absolute',
    right: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  statusMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease-in-out',
  },
  orderDetailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  finalTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  finalTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  finalTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#48c479',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  qrButton: {
    backgroundColor: '#FC8019',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderWaitingScreen;