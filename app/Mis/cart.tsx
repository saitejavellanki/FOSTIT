import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { firestore, getCurrentUser } from '../../components/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { WebView } from 'react-native-webview';
import { generateHash } from '../Utils/payuHash';
import * as Linking from "expo-linking"
import Ads from '@/components/Ads';
import OrderSuccessScreen from '../screen/OrderSuccessScreen';
import CouponComponent from '@/components/CouponComponent';
import PreviousOrders from './PreviousOrders';
interface PayUConfig {
    merchantKey: string;
    merchantSalt: string;
    surl: string;
    furl: string;
  }
  
  interface PaymentData {
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    hash: string;
  }

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  shopId: string;
  shopName?: string;
  dietType: 'veg' | 'non-veg';
  category?: string;
  description?: string;
  vendorId?: string;
}

const CartScreen: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);
    const payuConfig: PayUConfig = {
        merchantKey: 'gSR07M',
        merchantSalt: 'RZdd32itbMYSKM7Kwo4teRkhUKCsWbnj',
        surl: 'https://yourdomain.com/payment/success',
        furl: 'https://yourdomain.com/payment/failure'
      };

  useEffect(() => {
    loadCartItems();
    userDetails()
  }, []);
const userDetails = async()=>{
  
}
  const loadCartItems = async () => {
    try {
      const cartString = await AsyncStorage.getItem('cart');
      
      if (cartString) {
        const items = JSON.parse(cartString);
        setCartItems(items);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const generatePaymentData = async (currentUser: any) => {
    const txnid = `TXN_${Date.now()}`;
    const amount = (getTotalPrice() - discount).toString();
    const productinfo = 'Food Order';
    
    const paymentData: PaymentData = {
      txnid,
      amount,
      productinfo,
      firstname: currentUser.displayName || 'Customer',
      email: currentUser.email,
      phone: currentUser.phoneNumber || '',
      hash: ''
    };
  
    // Generate hash with the correct parameters
    paymentData.hash = generateHash(
      {
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        productinfo: paymentData.productinfo,
        firstname: paymentData.firstname,
        email: paymentData.email
      },
      'gSR07M',
      'RZdd32itbMYSKM7Kwo4teRkhUKCsWbnj'
    );
    
    return paymentData;
  };

  const handlePaymentResponse = (response: any) => {
    const urlParams = new URLSearchParams(response.url);
    
    if (response.url.includes(payuConfig.surl)) {
        // Payment Success
        createFirebaseOrder().then(() => {
            setShowPaymentGateway(false);
            setShowSuccessAnimation(true);
            // After 2 seconds, redirect to order waiting page
            setTimeout(() => {
                if (successOrderId) {
                    router.push({
                        pathname: '/Mis/orderwaiting',
                        params: { orderId: successOrderId }
                    });
                }
            }, 2000);
        });
    } else if (response.url.includes(payuConfig.furl)) {
        setShowPaymentGateway(false);
        Alert.alert('Failed', 'Payment failed. Please try again.');
    }
};

  const createFirebaseOrder = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.email) {
        Alert.alert('Error', 'Please login to proceed with checkout');
        return;
      }
  
      // Clean and validate order items
      const orderItems = cartItems.map(item => ({
        category: item.category || '',
        description: item.description || '',
        dietType: item.dietType || 'non-veg',
        id: item.id || '',
        imageUrl: item.imageUrl || '',
        isActive: true,
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        shopId: item.shopId || '',
        shopName: item.shopName || '',
        vendorId: item.vendorId || ''
      }));
  
      const totalAmount = getTotalPrice() - discount;
      const uniqueShopIds = [...new Set(orderItems.map(item => item.shopId))];
      
      if (uniqueShopIds.length > 1) {
        Alert.alert('Error', 'Orders can only contain items from one shop');
        return;
      }
  
      const orderData = {
        clearCart: true,
        confirmedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        customerEmail: currentUser.email,
        customerId: currentUser.uid,
        items: orderItems,
        status: 'pending',
        totalAmount: totalAmount,
        shopId: uniqueShopIds[0] || ''
      };
  
      const ordersRef = collection(firestore, 'orders');
      const orderDoc = await addDoc(ordersRef, orderData);
      
      await AsyncStorage.removeItem('cart');
      setCartItems([]);
      
      setSuccessOrderId(orderDoc.id);
      

      // router.push({
      //   pathname: '/Mis/orderwaiting',
      //   params: { orderId: orderDoc.id }
      // });
  
    } catch (error) {
      console.error('Order creation error:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    if (successOrderId) {
      router.push({
        pathname: '/Mis/orderwaiting',
        params: { orderId: successOrderId }
      });
    }
  };

  if (showSuccessAnimation) {
    return (
        <OrderSuccessScreen 
            onAnimationComplete={() => {
                if (successOrderId) {
                    router.push({
                        pathname: '/Mis/orderwaiting',
                        params: { orderId: successOrderId }
                    });
                }
            }}
        />
    );
}

  const updateCart = async (updatedItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, increment: boolean) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
        if (newQuantity < 1) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter((item): item is CartItem => item !== null);

    await updateCart(updatedItems);
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: async () => {
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            await updateCart(updatedItems);
          },
          style: "destructive"
        }
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = async () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: async () => {
            await AsyncStorage.removeItem('cart');
            setCartItems([]);
          },
          style: "destructive"
        }
      ]
    );
  };

  const proceedToCheckout = async () => {
    try {
        setCheckoutLoading(true);
        console.log('Proceeding to checkout...');
        
        if (!firestore || !getCurrentUser) {
            console.error('Firebase not properly initialized');
            Alert.alert('Error', 'System configuration error. Please try again later.');
            return;
        }
    
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        
        if (!currentUser?.email) {
            Alert.alert('Error', 'Please login to proceed with checkout');
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        // Generate payment data for PayU
        const paymentData = await generatePaymentData(currentUser);
        setPaymentData(paymentData);
        setShowPaymentGateway(true);
        
    } catch (error) {
        console.error('Error in proceedToCheckout:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
        setCheckoutLoading(false);
    }
};

const handleBack = () => {
  router.back();
};

if (loading) {
  return (
      <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeContent}>
              <ThemedView style={styles.loadingContainer}>
                  <ThemedText>Loading cart...</ThemedText>
              </ThemedView>
          </View>
      </SafeAreaView>
  );
}

if (cartItems.length === 0) {
  return (
      <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeContent}>
              <View style={styles.header}>
                  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                      <MaterialIcons name="arrow-back" size={24} color="#2b3240" />
                  </TouchableOpacity>
              </View>
              <ThemedView style={styles.emptyContainer}>
                  <MaterialIcons name="shopping-cart" size={64} color="#ccc" />
                  <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
                  <TouchableOpacity
                      style={styles.continueShopping}
                      onPress={() => router.back()}
                  >
                      <ThemedText style={styles.continueShoppingText}>Continue Shopping</ThemedText>
                  </TouchableOpacity>
              </ThemedView>
          </View>
      </SafeAreaView>
  );
}

  if (showPaymentGateway && paymentData) {
    const payuForm = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <form id="payuForm" action="https://secure.payu.in/_payment" method="post">
            <input type="hidden" name="key" value="gSR07M" />
            <input type="hidden" name="txnid" value="${paymentData.txnid}" />
            <input type="hidden" name="amount" value="${paymentData.amount}" />
            <input type="hidden" name="productinfo" value="${paymentData.productinfo}" />
            <input type="hidden" name="firstname" value="${paymentData.firstname}" />
            <input type="hidden" name="email" value="${paymentData.email}" />
            <input type="hidden" name="phone" value="${paymentData.phone}" />
            <input type="hidden" name="surl" value="${payuConfig.surl}" />
            <input type="hidden" name="furl" value="${payuConfig.furl}" />
            <input type="hidden" name="hash" value="${paymentData.hash}" />
          </form>
          <script>
            window.onload = function() {
              document.getElementById('payuForm').submit();

            }
          </script>
        </body>
      </html>
    `;
  
    return (
      <WebView
        source={{ html: payuForm }}
        onNavigationStateChange={handlePaymentResponse}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
              
         
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          // Alert.alert('Error', 'Failed to load payment gateway');
        }}
      
        
        javaScriptCanOpenWindowsAutomatically={true}
        onOpenWindow={(syntheticEvent:any)=>{
          const { nativeEvent } = syntheticEvent;
          const {targetUrl} = nativeEvent;
        
        return
        }}
setSupportMultipleWindows={true}

allowUniversalAccessFromFileURLs={true}
allowsBackForwardNavigationGestures={true}

        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
          Alert.alert('Error', `Payment gateway error: ${nativeEvent.statusCode}`);
        }}
      />
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
    <ThemedView style={styles.container}>
      {checkoutLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fc8019" />
          <ThemedText style={styles.loadingText}>Processing checkout...</ThemedText>
        </View>
      )}

<View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color="#2b3240" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Shopping Cart</ThemedText>
          
        </View>
      
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <View style={[
                  styles.dietTypeBadge,
                  { backgroundColor: item.dietType === 'veg' ? '#e8f5e9' : '#ffebee' }
                ]}>
                  <ThemedText style={[
                    styles.dietTypeText,
                    { color: item.dietType === 'veg' ? '#2e7d32' : '#c62828' }
                  ]}>
                    {item.dietType === 'veg' ? 'Veg' : 'Non-Veg'}
                  </ThemedText>
                </View>
              </View>

              {item.shopName && (
                <ThemedText style={styles.shopName}>
                  <MaterialIcons name="store" size={14} color="#666" /> {item.shopName}
                </ThemedText>
              )}
              
              <View style={styles.priceQuantityContainer}>
                <ThemedText style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.quantityButtonLeft]}
                    onPress={() => updateQuantity(item.id, false)}
                  >
                    <MaterialIcons name="remove" size={18} color="#fc8019" />
                  </TouchableOpacity>
                  
                  <View style={styles.quantityWrapper}>
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.quantityButtonRight]}
                    onPress={() => updateQuantity(item.id, true)}
                  >
                    <MaterialIcons name="add" size={18} color="#fc8019" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <MaterialIcons name="delete-outline" size={22} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        ))}
        
      </ScrollView>
      
      <CouponComponent
  totalAmount={getTotalPrice()}
  onApplyCoupon={(discountAmount) => setDiscount(discountAmount)}
  onRemoveCoupon={() => setDiscount(0)}
/>
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>Total Amount</ThemedText>
          <ThemedText style={styles.totalAmount}>
  ₹{(getTotalPrice() - discount).toFixed(2)}
</ThemedText>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCart}
            disabled={checkoutLoading}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#fff" />
            <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkoutButton, checkoutLoading && styles.disabledButton]}
            onPress={proceedToCheckout}
            disabled={checkoutLoading}
          >
            <MaterialIcons name="shopping-cart-checkout" size={20} color="#fff" />
            <ThemedText style={styles.checkoutButtonText}>
              {checkoutLoading ? 'Processing...' : 'Checkout'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
},
safeContent: {
    flex: 1,
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  height: 56,
},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2b3240',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerRight: {
    width: 40, // To balance the header layout
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    color: '#666',
  },
  continueShopping: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fc8019',
    borderRadius: 12,
    elevation: 2,
  },
  continueShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  shopName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b3240',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#fff',
  },
  quantityButtonLeft: {
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityButtonRight: {
    borderLeftWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityWrapper: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2b3240',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b3240',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  checkoutButton: {
    backgroundColor: '#fc8019',
    padding: 12,
    borderRadius: 8,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  dietTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  dietTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    zIndex: 1,
    marginTop: 40
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  adsContainer: {
    
  },
});

export default CartScreen;