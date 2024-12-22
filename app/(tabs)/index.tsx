import React, { useEffect, useState } from 'react';
import { ScrollView, View, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../components/firebase/firebase';
import { ActiveOrdersSection } from '../Mis/ActiveOrder';

// Types remain the same
interface ShopData {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: any;
  vendorId: string;
}

interface RestaurantCardProps {
  name: string;
  imageUrl: string;
  id: string;
}

interface CategoryButtonProps {
  label: string;
  icon?: string;
}

interface LocationState {
  address: string;
  loading: boolean;
  error: string | null;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ name, imageUrl, id }) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={() => router.push({
        pathname: '/Mis/shop',
        params: { shopId: id }
      })}
    >
      <Image 
        source={{ uri: imageUrl }}
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <ThemedText type="subtitle">{name}</ThemedText>
        <View style={styles.restaurantMeta}>
          {/* <View style={styles.ratingPill}>
            <ThemedText style={styles.ratingText}>New</ThemedText>
          </View> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CategoryButton: React.FC<CategoryButtonProps> = ({ label }) => (
  <TouchableOpacity style={styles.categoryButton}>
    <Image 
      source={{ uri: '/api/placeholder/60/60' }}
      style={styles.categoryIcon}
    />
    <ThemedText style={styles.categoryLabel}>{label}</ThemedText>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [shops, setShops] = useState<ShopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationState, setLocationState] = useState<LocationState>({
    address: 'Loading location...',
    loading: true,
    error: null,
  });

  // Fetch shops and location effects remain the same
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationState({
            address: 'Location access denied',
            loading: false,
            error: 'Permission to access location was denied',
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          const formattedAddress = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`;
          setLocationState({
            address: formattedAddress,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setLocationState({
          address: 'Location unavailable',
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location',
        });
      }
    };

    getLocation();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.mainScroll}
        stickyHeaderIndices={[1]} // Makes search bar sticky
      >
        <View style={styles.locationHeader}>
          <MaterialIcons name="location-on" size={24} color="#FC8019" />
          <View>
            <ThemedText type="defaultSemiBold">Home</ThemedText>
            <ThemedText style={[
              styles.addressText,
              locationState.error && styles.errorText
            ]}>
              {locationState.error ? 'Location unavailable' : locationState.address}
            </ThemedText>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          {/* <View style={styles.searchContainer}>
            <TouchableOpacity 
              style={styles.searchBar}
              onPress={() => router.push('/')}
            >
              <MaterialIcons name="search" size={20} color="#666" />
              <TextInput 
                placeholder="Search for restaurants and food"
                style={styles.searchInput}
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialIcons name="tune" size={24} color="#666" />
            </TouchableOpacity>
          </View> */}
        </View>

        <ActiveOrdersSection />

        <View style={styles.contentContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersScroll}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.offerCard}>
                <MaterialIcons name="local-offer" size={20} color="#FC8019" />
                <ThemedText style={styles.offerText}>50% OFF up to ₹100</ThemedText>
              </View>
            ))}
          </ScrollView>

          {/* <View style={styles.categoriesSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>What's on your mind?</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Pizza', 'Burgers', 'Biryani', 'Chinese', 'South Indian'].map((category) => (
                <CategoryButton key={category} label={category} />
              ))}
            </ScrollView>
          </View> */}

          <View style={styles.restaurantsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Available Shops</ThemedText>
            {loading ? (
              <ThemedText>Loading shops...</ThemedText>
            ) : shops.length === 0 ? (
              <ThemedText>No shops available</ThemedText>
            ) : (
              shops.map((shop) => (
                <RestaurantCard
                  key={shop.id}
                  id={shop.id}
                  name={shop.name}
                  imageUrl={shop.imageUrl}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainScroll: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
  },
  searchWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  offersScroll: {
    padding: 16,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f3',
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ffeedd',
  },
  offerText: {
    color: '#FC8019',
    fontWeight: '600',
  },
  categoriesSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  restaurantsSection: {
    padding: 16,
  },
  restaurantCard: {
    marginBottom: 24,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  restaurantInfo: {
    gap: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingPill: {
    backgroundColor: '#48c479',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff0000',
  },
});

export default HomeScreen;