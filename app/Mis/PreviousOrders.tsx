import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { firestore, getCurrentUser, storage } from '@/components/firebase/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  shopId: string;
  shopName: string;
  dietType: 'veg' | 'non-veg';
  category?: string;
  rating?: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  createdAt: any;
  totalAmount: number;
  status: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ItemCard: React.FC<{ 
  item: OrderItem; 
  imageUrl: string | null;
  onPress: () => void;
  index: number;
}> = ({ item, imageUrl, onPress, index }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(50)).current; // Changed from translateY to translateX

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, { // Animation now moves horizontally
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedTouchableOpacity 
      style={[
        styles.itemCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX }],
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageUrl ? { uri: imageUrl } : { uri: 'https://via.placeholder.com/200' }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={[
          styles.dietIndicator,
          { backgroundColor: item.dietType === 'veg' ? '#48c479' : '#ff4d4d' }
        ]} />
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Feather name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          </View>
        )}
      </View>
      
      <BlurView intensity={80} tint="light" style={styles.itemInfo}>
        <ThemedText numberOfLines={2} style={styles.itemName}>
          {item.name}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.shopName}>
          {item.shopName}
        </ThemedText>
        <View style={styles.bottomRow}>
          <View>
            <ThemedText style={styles.price}>₹{item.price}</ThemedText>
            <ThemedText style={styles.priceSubtext}>Inc. of taxes</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={onPress}
          >
            <MaterialIcons name="refresh" size={16} color="#fff" />
            <ThemedText style={styles.reorderText}>Reorder</ThemedText>
          </TouchableOpacity>
        </View>
      </BlurView>
    </AnimatedTouchableOpacity>
  );
};

const PreviousOrders: React.FC = () => {
  const [previousOrders, setPreviousOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const fetchImageUrl = async (imagePath: string) => {
    try {
      const imageRef = ref(storage, imagePath);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return null;
    }
  };

  const fetchPreviousOrders = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const ordersRef = collection(firestore, 'orders');
      const q = query(
        ordersRef,
        where('customerId', '==', currentUser.uid),
        where('status', '==', 'picked_up'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });

      const uniqueItems = new Map<string, OrderItem>();
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!uniqueItems.has(item.id)) {
            uniqueItems.set(item.id, {
              ...item,
              
            });
          }
        });
      });

      const items = Array.from(uniqueItems.values());
      setPreviousOrders(items);

      // Fetch image URLs
      const urls: Record<string, string> = {};
      for (const item of items) {
        if (item.imageUrl) {
          const url = await fetchImageUrl(item.imageUrl);
          if (url) {
            urls[item.id] = url;
          }
        }
      }
      setImageUrls(urls);
    } catch (error) {
      console.error('Error fetching previous orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPreviousOrders();
  }, []);

  const handleReorder = async (item: OrderItem) => {
    try {
      const cartString = await AsyncStorage.getItem('cart');
      let cart: OrderItem[] = cartString ? JSON.parse(cartString) : [];

      if (cart.length > 0 && cart[0].shopId !== item.shopId) {
        throw new Error('Cannot add items from different shops');
      }

      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        cart = cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        cart.push({ ...item, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      router.push('/Mis/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC8019" />
      </View>
    );
  }

  if (previousOrders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="restaurant" size={80} color="#ddd" />
        <ThemedText style={styles.emptyTitle}>No Orders Yet</ThemedText>
        <ThemedText style={styles.emptyText}>
          Looks like you haven't placed any orders yet. Start exploring delicious food options!
        </ThemedText>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/')}
        >
          <ThemedText style={styles.exploreButtonText}>Explore Restaurants</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchPreviousOrders();
          }}
          colors={['#FC8019']}
          tintColor="#FC8019"
        />
      }
    >
      <ThemedText type="subtitle" style={styles.title}>Previous Orders</ThemedText>
      <ThemedText style={styles.subtitle}>Quick reorder from your order history</ThemedText>
      
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
      >
        {previousOrders.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            imageUrl={imageUrls[item.id]}
            onPress={() => handleReorder(item)}
            index={index}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridContainer: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  horizontalScrollContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  itemCard: {
    width: Dimensions.get('window').width * 0.75, // Cards take 75% of screen width
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  dietIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemInfo: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#48c479',
  },
  priceSubtext: {
    fontSize: 10,
    color: '#999',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FC8019',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  reorderText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FC8019',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PreviousOrders;