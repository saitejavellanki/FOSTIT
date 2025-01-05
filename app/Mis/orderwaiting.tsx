import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  Modal,
  BackHandler
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { firestore } from '../../components/firebase/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';

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
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [isReadyForPickup, setIsReadyForPickup] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPickedUp, setIsPickedUp] = useState(false);

  const { orderId } = useLocalSearchParams();

  useEffect(() => {
    // Handle back button press when modal is open
    const backAction = () => {
      if (isQRModalVisible) {
        setIsQRModalVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isQRModalVisible]);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }

    const orderRef = doc(firestore, 'orders', orderId as string);
    const unsubscribe = onSnapshot(orderRef, 
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as OrderDetails;
          setOrderStatus(data.status);
          setIsReadyForPickup(data.status === 'completed');
          setIsCancelled(data.status === 'cancelled');
          
          // Check if the order was picked up
          if (data.pickedUp || data.status === 'picked_up') {
            setIsQRModalVisible(false); // Close the modal first
            setIsPickedUp(true); // Then update pickup status
            
            // Redirect after a brief delay
            setTimeout(() => {
              router.replace('/');
            }, 2000);
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
      setIsQRModalVisible(false); // Close modal first
      
      const orderRef = doc(firestore, 'orders', orderId as string);
      await updateDoc(orderRef, {
        pickedUp: true,
        status: 'picked_up'
      });

      // The status update will trigger the useEffect above
      // which will handle the pickup state and navigation
    } catch (error) {
      console.error('Error updating order pickup status:', error);
      Alert.alert('Error', 'Failed to update order pickup status');
    }
  };

  

  const getStatusInfo = () => {
    if (isPickedUp) {
      return {
        icon: 'check-circle',
        color: '#48c479',
        title: 'Order Picked Up',
        message: 'Your order has been successfully picked up',
        progress: 100
      };
    }

    if (isCancelled) {
      return {
        icon: 'cancel',
        color: '#ff4d4d',
        title: 'Order Cancelled',
        message: 'Unfortunately, this order has been cancelled',
        progress: 0
      };
    }

    switch(orderStatus) {
      case 'pending':
        return {
          icon: 'schedule',
          color: '#fc8019',
          title: 'Order Accepted',
          message: 'Your order has been received and is being reviewed',
          progress: 30
        };
      case 'processing':
        return {
          icon: 'shopping-bag',
          color: '#fc8019',
          title: 'Order Being Prepared',
          message: 'Your order is currently being prepared',
          progress: 70
        };
      case 'completed':
        return {
          icon: 'check-circle',
          color: '#48c479',
          title: 'Ready for Pickup',
          message: 'Your order is ready to collect',
          progress: 100
        };
      case 'picked_up':
        return {
          icon: 'check-circle',
          color: '#48c479',
          title: 'Order Picked Up',
          message: 'Your order has been successfully picked up',
          progress: 100
        };
      default:
        return {
          icon: 'info',
          color: '#666',
          title: 'Processing Order',
          message: 'Your order is being processed',
          progress: 50
        };
    }
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
          ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
        </ThemedText>
      </View>
    ));
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fc8019" />
      </ThemedView>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
      <View style={styles.statusCard}>
        
          <MaterialIcons  name={statusInfo.icon} size={48} color={statusInfo.color} />
          <ThemedText style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </ThemedText>
          <ThemedText style={styles.statusMessage}>{statusInfo.message}</ThemedText>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${statusInfo.progress}%`,
                  backgroundColor: statusInfo.color 
                }
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
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>₹{(orderDetails.totalAmount || 0).toFixed(2)}</ThemedText>
              </View>
              {orderDetails.tax && (
                <View style={styles.totalRow}>
                  <ThemedText>Tax</ThemedText>
                  <ThemedText>₹{(orderDetails.tax || 0).toFixed(2)}</ThemedText>
                </View>
              )}
              <View style={[styles.totalRow, styles.finalTotal]}>
                <ThemedText style={styles.totalText}>Total</ThemedText>
                <ThemedText style={styles.totalAmount}>
                ₹{((orderDetails.totalAmount || 0) + (orderDetails.tax || 0)).toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {isReadyForPickup && !isPickedUp && (
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setIsQRModalVisible(true)}
          >
            <ThemedText style={styles.qrButtonText}>Show QR Code</ThemedText>
          </TouchableOpacity>
        )}

        <Modal
          visible={isQRModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsQRModalVisible(false)}
        >
          <View style={styles.modalContainer}>
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
          </View>
        </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  orderDetailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48c479',
  },
  qrButton: {
    backgroundColor: '#fc8019',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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