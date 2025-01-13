import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { firestore } from '../../components/firebase/firebase';
import LoadingScreen from '../Mis/LoadingScreen';
import { CartButton } from '../../components/CartButton';
import { CategorySection } from '../../components/CategorySection';
import { styles } from './styles';
import { ShopDetails, MenuItem, CartItem } from './types';
import Showcart from '@/components/Showcart';
import ShopHeader from '@/components/ShopHeader';
import Footer from '@/components/Footer';

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
        categorizeItems(itemsList);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  const handleSearchResults = (filteredItems: MenuItem[]) => {
    categorizeItems(filteredItems);
  };

  const categorizeItems = (itemsList: MenuItem[]) => {
    const categorized = itemsList.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    setCategorizedItems(categorized);
  };

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
      <ShopHeader 
        items={items}
        onSearchResults={handleSearchResults}
      />
      <ScrollView>
        {shopDetails && (
          <View style={styles.shopHeader}>
            <Image
              source={{ uri: shopDetails.imageUrl }}
              style={styles.shopImage}
            />
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
      
      <Footer shopName={shopDetails?.name ?? ''} />
      <Showcart />
      
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

export default ShopScreen;