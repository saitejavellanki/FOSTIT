import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, StyleSheet, TouchableOpacity, Modal as RNModal, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { collection, query, where, getDocs, getDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { firestore } from '../../components/firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '../Mis/LoadingScreen'; // Adjust the import path based on your file structure

// Interfaces
interface ShopDetails {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  vendorId: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  dietType: 'veg' | 'non-veg';
  shopId: string;
  vendorId: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  shopName?: string;
}

interface CategorySectionProps {
  title: string;
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
  addToCart: (item: MenuItem) => void;
}

const { width } = Dimensions.get('window');

const CartButton = () => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const getCartCount = async () => {
      try {
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
          setItemCount(count);
        }
      } catch (error) {
        console.error('Error getting cart count:', error);
      }
    };

    getCartCount();
    
    // Set up an interval to periodically check cart count
    const interval = setInterval(getCartCount, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity 
      style={styles.cartButton}
      onPress={() => router.push('/(tabs)/Cart')}
    >
      <MaterialIcons name="shopping-cart" size={24} color="#fff" />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{itemCount}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const CategorySection: React.FC<CategorySectionProps> = ({ title, items, onItemPress, addToCart }) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.categorySection}>
      <ThemedText type="subtitle" style={styles.categoryTitle}>{title}</ThemedText>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            !item.isActive && styles.inactiveItem
          ]}
          onPress={() => onItemPress(item)}
          disabled={!item.isActive}
        >
          <View style={styles.menuItemContent}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.menuItemImage}
            />
            <View style={styles.menuItemInfo}>
              <View style={styles.menuItemHeader}>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <View style={[
                  styles.dietTypeBadge,
                  { backgroundColor: item.dietType === 'veg' ? '#48c479' : '#ff4d4d' }
                ]}>
                  <ThemedText style={styles.dietTypeText}>
                    {item.dietType === 'veg' ? 'Veg' : 'Non-Veg'}
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </ThemedText>
              
              <View style={styles.menuItemFooter}>
                <ThemedText style={[
                  styles.price,
                  !item.isActive && styles.inactivePrice
                ]}>
                  ₹{item.price.toFixed(2)}
                </ThemedText>
                
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !item.isActive && styles.inactiveButton
                  ]}
                  onPress={() => addToCart(item)}
                  disabled={!item.isActive}
                >
                  <ThemedText style={styles.addButtonText}>
                    {item.isActive ? 'Add' : 'Unavailable'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ShopScreen: React.FC = () => {
  const { shopId } = useLocalSearchParams();
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categorizedItems, setCategorizedItems] = useState<Record<string, MenuItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId || typeof shopId !== 'string') {
        setError('Invalid shop ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching shop data for shopId:', shopId);
        
        // 1. Fetch shop details
        const shopRef = doc(firestore, 'shops', shopId);
        const shopSnap = await getDoc(shopRef);
        
        if (!shopSnap.exists()) {
          throw new Error('Shop not found');
        }
        
        const shopData = {
          id: shopSnap.id,
          ...shopSnap.data()
        } as ShopDetails;
        
        setShopDetails(shopData);

        // 2. Fetch items for this specific shop
        const itemsRef = collection(firestore, 'items');
        const itemsQuery = query(itemsRef, where('shopId', '==', shopId));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        const itemsList = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MenuItem));

        setItems(itemsList);

        // 3. Categorize items
        const categorized = itemsList.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {} as Record<string, MenuItem[]>);

        setCategorizedItems(categorized);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  const addToCart = async (item: MenuItem) => {
    if (!item.isActive) return;

    try {
      const cartString = await AsyncStorage.getItem('cart');
      const cart: CartItem[] = cartString ? JSON.parse(cartString) : [];
      
      const existingItemIndex = cart.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        cart.push({
          ...item,
          quantity: 1,
          shopId: shopId as string,
          shopName: shopDetails?.name
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
    // return (
    //   <ThemedView style={styles.loadingContainer}>
    //     <ThemedText>Loading...</ThemedText>
    //   </ThemedView>
    // );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {shopDetails && (
          <View style={styles.shopHeader}>
            <Image
              source={{ uri: shopDetails.imageUrl }}
              style={styles.shopImage}
            />
            <CartButton />
            <View style={styles.shopInfo}>
              <ThemedText>{shopDetails.name}</ThemedText>
              {shopDetails.description && (
                <ThemedText style={styles.shopDescription}>
                  {shopDetails.description}
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {Object.entries(categorizedItems)
          .filter(([category, items]) => items.length > 0 && category !== 'Uncategorized')
          .map(([category, items]) => (
            <CategorySection
              key={category}
              title={category}
              items={items}
              onItemPress={(item) => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
              addToCart={addToCart}
            />
          ))}
      </ScrollView>

      <RNModal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>

              <Image
                source={{ uri: selectedItem.imageUrl }}
                style={styles.modalImage}
              />

              <View style={styles.modalInfo}>
                <ThemedText>{selectedItem.name}</ThemedText>
                <View style={[
                  styles.dietTypeBadge,
                  { backgroundColor: selectedItem.dietType === 'veg' ? '#48c479' : '#ff4d4d' }
                ]}>
                  <ThemedText style={styles.dietTypeText}>
                    {selectedItem.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                  </ThemedText>
                </View>
                
                <ThemedText style={styles.modalDescription}>
                  {selectedItem.description}
                </ThemedText>

                <View style={styles.modalFooter}>
                  <ThemedText style={styles.modalPrice}>
                    ₹{selectedItem.price.toFixed(2)}
                  </ThemedText>
                  
                  <TouchableOpacity
                    style={[
                      styles.modalAddButton,
                      !selectedItem.isActive && styles.inactiveButton
                    ]}
                    onPress={() => {
                      addToCart(selectedItem);
                      setModalVisible(false);
                    }}
                    disabled={!selectedItem.isActive}
                  >
                    <ThemedText style={styles.addButtonText}>
                      {selectedItem.isActive ? 'Add to Cart' : 'Unavailable'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </RNModal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shopHeader: {
    width: '100%',
    height: 200,
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  shopInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  shopDescription: {
    color: '#fff',
    marginTop: 8,
  },
  categorySection: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveItem: {
    opacity: 0.5,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48c479',
  },
  inactivePrice: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#fc8019',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  inactiveButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dietTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  dietTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalClose: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInfo: {
    padding: 16,
  },
  modalDescription: {
    marginTop: 8,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48c479',
  },
  modalAddButton: {
    backgroundColor: '#fc8019',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fc8019',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ff4d4d',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default ShopScreen;