import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { firestore, getCurrentUser } from '../../components/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { WebView } from 'react-native-webview';
import { generateHash } from '../Utils/payuHash'; // You'll need to create this utility
// import Config from 'react-native-config'; // For environment variables

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

    const payuConfig: PayUConfig = {
        merchantKey: 'gSR07M',
        merchantSalt: 'RZdd32itbMYSKM7Kwo4teRkhUKCsWbnj',
        surl: 'https://yourdomain.com/payment/success',
        furl: 'https://yourdomain.com/payment/failure'
      };

  useEffect(() => {
    loadCartItems();
  }, []);

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
    const amount = getTotalPrice().toString();
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
    // Parse the response URL
    const urlParams = new URLSearchParams(response.url);
    
    if (response.url.includes(payuConfig.surl)) {
      // Payment Success
      createFirebaseOrder();
      setShowPaymentGateway(false);
      Alert.alert('Success', 'Payment completed successfully!');
    } else if (response.url.includes(payuConfig.furl)) {
      // Payment Failure
      setShowPaymentGateway(false);
      Alert.alert('Failed', 'Payment failed. Please try again.');
    }
  };

  const createFirebaseOrder = async () => {
    try {
      console.log('Starting order creation process...');
      
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser?.email) {
        console.log('No user email found');
        Alert.alert('Error', 'Please login to proceed with checkout');
        return;
      }
  
      console.log('Preparing order items...');
      const orderItems = cartItems.map(item => ({
        category: item.category || '',
        description: item.description || '',
        dietType: item.dietType,
        id: item.id,
        imageUrl: item.imageUrl,
        isActive: true,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        shopId: item.shopId,
        shopName: item.shopName || '',
        vendorId: item.vendorId || ''
      }));
  
      console.log('Order items prepared:', orderItems);
      const totalAmount = getTotalPrice();
      console.log('Total amount calculated:', totalAmount);
  
      const uniqueShopIds = [...new Set(orderItems.map(item => item.shopId))];
      if (uniqueShopIds.length > 1) {
        console.log('Multiple shops detected in cart:', uniqueShopIds);
        Alert.alert('Error', 'Orders can only contain items from one shop. Please adjust your cart.');
        return;
      }
      const shopId = uniqueShopIds[0];
      console.log('Shop ID for order:', shopId);
  
      const orderData = {
        clearCart: true,
        confirmedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        customerEmail: currentUser.email,
        customerId: currentUser.uid,
        items: orderItems,
        status: 'pending',
        totalAmount: totalAmount,
        shopId: shopId || null // Include shopId in the order data
      };
  
      console.log('Order data prepared:', orderData);
      console.log('Getting orders collection reference...');
      const ordersRef = collection(firestore, 'orders');
      console.log('Orders collection reference obtained');
      
      console.log('Adding order to Firebase...');
      const orderDoc = await addDoc(ordersRef, orderData);
      console.log('Order added successfully:', orderDoc.id);
      
      console.log('Clearing local cart...');
      await AsyncStorage.removeItem('cart');
      setCartItems([]);
      console.log('Local cart cleared');
      
      // Navigate to the order waiting screen
      router.push({
        pathname: '/Mis/orderwaiting',
        params: { orderId: orderDoc.id }
      })
  
    } catch (error) {
      console.error('Detailed error in createFirebaseOrder:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Show error alert to user
      Alert.alert(
        'Error',
        'Failed to create order. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Error alert closed')
          }
        ]
      );
      
      // Optionally, you might want to throw the error to be handled by a parent component
      throw error;
    } finally {
      // If you have any loading state, reset it here
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading cart...</ThemedText>
      </ThemedView>
    );
  }

  if (cartItems.length === 0) {
    return (
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
          Alert.alert('Error', 'Failed to load payment gateway');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
          Alert.alert('Error', `Payment gateway error: ${nativeEvent.statusCode}`);
        }}
      />
    );
  }
  return (
    <ThemedView style={styles.container}>
        {checkoutLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fc8019" />
                    <ThemedText style={styles.loadingText}>Processing checkout...</ThemedText>
                </View>
            )}
      <ScrollView style={styles.itemsList}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {/* <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> */}
            
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <View style={[
                  styles.dietTypeBadge,
                  { backgroundColor: item.dietType === 'veg' ? '#48c479' : '#ff4d4d' }
                ]}>
                  <ThemedText style={styles.dietTypeText}>
                    {item.dietType === 'veg' ? 'Veg' : 'Non-Veg'}
                  </ThemedText>
                </View>
              </View>

              {item.shopName && (
                <ThemedText style={styles.shopName}>from {item.shopName}</ThemedText>
              )}
              
              <View style={styles.priceQuantityContainer}>
                <ThemedText style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, false)}
                  >
                    <MaterialIcons name="remove" size={20} color="#fc8019" />
                  </TouchableOpacity>
                  
                  <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, true)}
                  >
                    <MaterialIcons name="add" size={20} color="#fc8019" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <ThemedText style={styles.totalText}>Total:</ThemedText>
                    <ThemedText style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</ThemedText>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearCart}
                        disabled={checkoutLoading}
                    >
                        <ThemedText style={styles.clearButtonText}>Clear Cart</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkoutButton, checkoutLoading && styles.disabledButton]}
                        onPress={proceedToCheckout}
                        disabled={checkoutLoading}
                    >
                        <ThemedText style={styles.checkoutButtonText}>
                            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#48c479',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48c479',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#fc8019',
    padding: 12,
    borderRadius: 8,
    flex: 2,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dietTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
},
disabledButton: {
    opacity: 0.7,
},
});

export default CartScreen;