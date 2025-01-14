import React, { useEffect, useState, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  Platform, 
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ActiveOrdersSection } from '../Mis/ActiveOrder';
import Showcart from '@/components/Showcart';
import AvailableShops from '../Mis/AvailableShops';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PreviousOrders from '../Mis/PreviousOrders';
import { PullToRefreshScrollView } from '@/components/PullToRefreshScrollView';
import Ads from '@/components/Ads';
import OffersSection from '@/components/Offers';
import HowItWorksBanner from '@/components/HowItWorksBanner';


interface LocationState {
  address: string;
  loading: boolean;
  error: string | null;
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationState, setLocationState] = useState<LocationState>({
    address: 'Loading location...',
    loading: true,
    error: null,
  });

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

  useEffect(() => {
    getLocation();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getLocation(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Calculate bottom padding to account for tab bar height
  const TAB_BAR_HEIGHT = 60;
  const bottomPadding = Platform.OS === 'ios' ? 
    TAB_BAR_HEIGHT + insets.bottom : 
    TAB_BAR_HEIGHT;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FC8019' }]}>
      <ThemedView style={styles.container}>
      <View style={styles.cartWrapper}>
    <Showcart />
  </View>
        <PullToRefreshScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          contentContainerStyle: [
            styles.scrollContentContainer,
            { paddingBottom: bottomPadding + 20 }
          ],
        }}
      >
          <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
          <View style={styles.locationHeader}>
  <View style={styles.locationContainer}>
    <View style={styles.locationIcon}>
      <MaterialIcons name="location-on" size={20} color="white" />
    </View>
    <View>
      <ThemedText style={styles.locationTitle} type="defaultSemiBold">
        Location
      </ThemedText>
      <ThemedText 
        style={[styles.addressText, locationState.error && styles.errorText]}
        numberOfLines={1}
      >
        {locationState.error ? 'Location unavailable' : locationState.address}
      </ThemedText>
    </View>
  </View>
  <View style={styles.logoContainer}>
  <Image 
  source={require('../../assets/images/Fos_t-removebg-preview.png')} 
  style={styles.logoImage}
/>
  </View>
</View>

<View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#666" />
              <TextInput
                placeholder="Search for restaurants"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />
            </View>
          </View>

            <ActiveOrdersSection />
          </View>
          <HowItWorksBanner onPress={() => router.push('/Mis/HowitWorks')} />
          <Ads/>
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            

          <AvailableShops searchQuery={searchQuery} />
            
            <View style={styles.previousOrdersContainer}>
              <PreviousOrders />
            </View>
            <View style={styles.offersWrapper}>
    <OffersSection/>
  </View>
          </View>
          
          </PullToRefreshScrollView>
          
      </ThemedView>
    </SafeAreaView>
  );
};

const TAB_BAR_HEIGHT = 5;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  cartWrapper: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 16, // Adjust based on your nav bar height
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    marginBottom: -20,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  offersWrapper: {
  flex: 1,
  marginBottom: -20,
},
  header: {
    backgroundColor: '#FC8019',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  locationIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  },
  locationTitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  addressText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    maxWidth: Dimensions.get('window').width - 100,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  logoContainer: {
    paddingLeft: 36,
    justifyContent: 'center', // Centers the logo vertically
  },
  
  logoImage: {
    width: 100, // Increased from 100
    height: 45,  // Increased from 30 to maintain aspect ratio
    resizeMode: 'contain',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  offersContainer: {
    padding: 16,
    marginBottom: 24,
  },
  offersScrollContent: {
    paddingRight: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  viewAllText: {
    color: '#FC8019',
    fontSize: 14,
    fontWeight: '600',
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: Dimensions.get('window').width * 0.6,
  },
  offerText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  offerSubtext: {
    color: '#666',
    fontSize: 12,
  },
  errorText: {
    color: '#ff6b6b',
  },
  previousOrdersContainer: {
    marginBottom: 20,
  },
  
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1, // Takes available space but allows logo to show
  },
  
  
  
 
  
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  
});

export default HomeScreen;