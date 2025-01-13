import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl, 
  Image, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  Platform, 
  StatusBar 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '@/components/firebase/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter, useFocusEffect } from 'expo-router';
import PolicySections from '@/components/PolicySection';

type OrderItem = { name: string; quantity: number; price: number; id: string; };
type Order = {
  id: string;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  customerEmail: string;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LEVELS = {
  DIAMOND: { threshold: 50, color: '#E23744', icon: 'diamond', label: 'Connoisseur' },
  PLATINUM: { threshold: 30, color: '#EF4F5F', icon: 'star', label: 'Food Expert' },
  GOLD: { threshold: 20, color: '#FF7CA3', icon: 'trophy', label: 'Foodie' },
  SILVER: { threshold: 10, color: '#FF98B3', icon: 'medal', label: 'Regular' },
  BRONZE: { threshold: 0, color: '#FFB4C5', icon: 'shield', label: 'Explorer' }
} as const;

const STATUS_COLORS = {
  completed: '#267E3E',
  processing: '#E23744',
  pending: '#EF4F5F',
  cancelled: '#B5B5B5'
} as const;

const ProfileScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<{ ongoing: Order[], history: Order[] }>({ ongoing: [], history: [] });
  const user = auth.currentUser;
  const router = useRouter();

  const theme = {
    bg: '#FFFFFF',
    text: '#1C1C1C',
    card: '#FFFFFF',
    border: '#E8E8E8',
    subtext: '#696969'
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
      return () => {
        // Cleanup if needed
      };
    }, [user])
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, {
        photoURL: downloadURL
      });
      
      setRefreshing(true);
      await fetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
      setRefreshing(false);
    }
  };

  const getUserLevel = (orderCount: number) => {
    const levelEntry = Object.entries(LEVELS).find(([_, data]) => orderCount >= data.threshold) || 
                      Object.entries(LEVELS).slice(-1)[0];
    return { name: levelEntry[0], ...levelEntry[1] };
  };

  const fetchOrders = async () => {
    if (!user?.email) return;
    
    try {
      const ordersRef = collection(firestore, 'orders');
      const [ongoing, history] = await Promise.all([
        getDocs(query(ordersRef, 
          where('customerEmail', '==', user.email),
          where('status', '!=', 'picked_up'),
          orderBy('createdAt', 'desc')
        )),
        getDocs(query(ordersRef,
          where('customerEmail', '==', user.email),
          where('status', '==', 'picked_up'),
          orderBy('createdAt', 'desc')
        ))
      ]);

      const mapDocs = (snapshot: any) => snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setOrders({
        ongoing: mapDocs(ongoing),
        history: mapDocs(history)
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <View style={[styles.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.restaurantInfo}>
          <ThemedText style={styles.restaurantName}>{order.shopName}</ThemedText>
          <ThemedText style={styles.date}>
            {order.createdAt.toLocaleDateString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[order.status]}15` }]}>
          <ThemedText style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.itemsList}>
        {order.items.map((item, i) => (
          <ThemedText key={i} style={styles.item}>
            {item.quantity}x {item.name}
          </ThemedText>
        ))}
      </View>
      
      <View style={styles.cardFooter}>
        <ThemedText style={styles.totalLabel}>Order Total</ThemedText>
        <ThemedText style={styles.amount}>₹{order.totalAmount.toFixed(2)}</ThemedText>
      </View>
    </View>
  );

  const level = getUserLevel(orders.ongoing.length + orders.history.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.bg}
      />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, Platform.OS === 'ios' && styles.iosButton]} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1C1C1C" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          <TouchableOpacity 
            style={[styles.logoutButton, Platform.OS === 'ios' && styles.iosButton]}
            onPress={() => auth.signOut().then(() => router.replace('/(auth)/welcome'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={24} color="#E23744" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={async () => {
                setRefreshing(true);
                await fetchOrders();
                setRefreshing(false);
              }}
              tintColor="#E23744"
            />
          }
        >
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <TouchableOpacity 
                onPress={pickImage}
                disabled={uploading}
                style={styles.avatarContainer}
              >
                {user?.photoURL ? (
                  <>
                    <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    <View style={styles.uploadOverlay}>
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                  </>
                ) : (
                  <View style={styles.avatarFallback}>
                    <Ionicons name="person" size={40} color="#E23744" />
                    <View style={styles.uploadOverlay}>
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ThemedText style={styles.uploadingText}>Uploading...</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>{user?.email || 'Foodie'}</ThemedText>
                <ThemedText style={styles.userEmail}>{'Hi Fostian'}</ThemedText>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.levelInfo}>
                <View style={[styles.levelIcon, { backgroundColor: `${level.color}15` }]}>
                  <Ionicons name={level.icon as any} size={24} color={level.color} />
                </View>
                <View>
                  <ThemedText style={styles.levelLabel}>{level.label}</ThemedText>
                  <ThemedText style={styles.orderCount}>
                    {orders.ongoing.length + orders.history.length} orders
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.ordersSection}>
            {orders.ongoing.length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>Active Orders</ThemedText>
                {orders.ongoing.map(order => <OrderCard key={order.id} order={order} />)}
              </>
            )}

            <ThemedText style={styles.sectionTitle}>Order History</ThemedText>
            {orders.history.length ? 
              orders.history.map(order => <OrderCard key={order.id} order={order} />) : 
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#B5B5B5" />
                <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
              </View>
            }
          </View>

          <PolicySections />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB700'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B00'
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5E6'
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5E6'
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF8500'
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FF8500'
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 0, 0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B00'
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFD000'
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFD000'
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 4
  },
  orderCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8500'
  },
  ordersSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFD000'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  iosButton: {
    opacity: 0.8,
  },
  restaurantInfo: {
    flex: 1
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8500'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD000'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  itemsList: {
    marginBottom: 16
  },
  item: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#FFD000'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFD000'
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000'
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    marginTop: 8
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginTop: 12
  }
});

export default ProfileScreen;