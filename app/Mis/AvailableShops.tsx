import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../components/firebase/firebase';
import { MaterialIcons } from '@expo/vector-icons';

interface ShopData {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: any;
  vendorId: string;
  rating?: number;
  cuisine?: string;
  deliveryTime?: string;
  minOrder?: string;
  distance?: string;
}

interface AvailableShopsProps {
    searchQuery: string;
}

interface RestaurantCardProps {
  shop: ShopData;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ shop }) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={() => router.push({
        pathname: '/Mis/shop',
        params: { shopId: shop.id }
      })}
    >
      <Image 
        source={{ uri: shop.imageUrl }}
        style={styles.restaurantImage}
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.restaurantName}>{shop.name}</ThemedText>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.rating}>{shop.rating || '4.5'}</ThemedText>
          </View>
        </View>
        
        <View style={styles.cuisineRow}>
          <MaterialIcons name="restaurant" size={14} color="#666" />
          <ThemedText style={styles.cuisine}>{shop.cuisine || 'Multi Cuisine'}</ThemedText>
        </View>

        
      </View>
    </TouchableOpacity>
  );
};

const AvailableShops: React.FC<AvailableShopsProps> = ({ searchQuery }) => {
    const [shops, setShops] = useState<ShopData[]>([]);
    const [filteredShops, setFilteredShops] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchShops = async () => {
        try {
          const shopsCollection = collection(firestore, 'shops');
          const shopsSnapshot = await getDocs(shopsCollection);
          const shopsData = shopsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ShopData[];
          
          setShops(shopsData);
          setFilteredShops(shopsData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching shops:', error);
          setLoading(false);
        }
      };
  
      fetchShops();
    }, []);
  
    useEffect(() => {
      if (searchQuery.trim() === '') {
        setFilteredShops(shops);
      } else {
        const filtered = shops.filter(shop =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredShops(filtered);
      }
    }, [searchQuery, shops]);
  
    if (loading) {
      return <ThemedText>Loading shops...</ThemedText>;
    }
  
    if (filteredShops.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <MaterialIcons name="search-off" size={48} color="#666" />
          <ThemedText style={styles.noResultsText}>
            No restaurants found matching "{searchQuery}"
          </ThemedText>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {searchQuery ? 'Search Results' : 'Popular Restaurants'}
          </ThemedText>
          
        </View>
        {filteredShops.map((shop) => (
          <RestaurantCard key={shop.id} shop={shop} />
        ))}
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: -30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // Added black color
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: '#FC8019',
    fontWeight: '500',
  },
  restaurantCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#000000', // Added black color
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cuisine: {
    color: '#666',
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  }
});

export default AvailableShops;