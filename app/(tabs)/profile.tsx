import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Image, StyleSheet, Platform, StatusBar, Alert, ImageBackground } from 'react-native';
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

type Order = {
  id: string;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  shopName: string;
  items: { name: string; quantity: number; price: number; id: string; }[];
  totalAmount: number;
  createdAt: Date;
  customerEmail: string;
};

const LEVELS = {
  DIAMOND: { threshold: 50, color: '#FF6B00', icon: 'diamond', label: 'Top Seller' },
  PLATINUM: { threshold: 30, color: '#FF8500', icon: 'star', label: 'Level 2 Seller' },
  GOLD: { threshold: 20, color: '#FFA500', icon: 'trophy', label: 'Level 1 Seller' },
  SILVER: { threshold: 10, color: '#FFB700', icon: 'medal', label: 'New Seller' },
  BRONZE: { threshold: 0, color: '#FFD000', icon: 'shield', label: 'New Member' }
};

const STATUS_COLORS = {
  completed: '#1DBF73',
  processing: '#FF8500',
  pending: '#FFA500',
  cancelled: '#E93F3F'
};

const ProfileScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState<{ ongoing: Order[], history: Order[] }>({ ongoing: [], history: [] });
  const user = auth.currentUser;
  const router = useRouter();

  useFocusEffect(React.useCallback(() => { fetchOrders(); }, [user]));

  const handleImagePick = async () => {
    if (!(await ImagePicker.requestMediaLibraryPermissionsAsync()).granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `profile_pictures/${user?.uid}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        await updateProfile(user!, { photoURL: downloadURL });
        await fetchOrders();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user?.email) return;
    try {
      const ordersRef = collection(firestore, 'orders');
      const [ongoing, history] = await Promise.all([
        getDocs(query(ordersRef, where('customerEmail', '==', user.email), where('status', '!=', 'picked_up'), orderBy('createdAt', 'desc'))),
        getDocs(query(ordersRef, where('customerEmail', '==', user.email), where('status', '==', 'picked_up'), orderBy('createdAt', 'desc')))
      ]);

      const mapDocs = (snapshot: any) => snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setOrders({ ongoing: mapDocs(ongoing), history: mapDocs(history) });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={s.shopImage}
        />
        <View style={s.orderInfo}>
          <View style={s.orderTopRow}>
            <ThemedText style={s.restaurantName}>{order.shopName}</ThemedText>
            <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLORS[order.status]}15` }]}>
              <ThemedText style={[s.statusText, { color: STATUS_COLORS[order.status] }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={s.orderDate}>
            Ordered on {order.createdAt.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </ThemedText>
        </View>
      </View>

      <View style={s.itemsList}>
        {order.items.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <ThemedText style={s.itemName}>
              {item.name}
            </ThemedText>
            <View style={s.itemDetails}>
              <ThemedText style={s.itemQuantity}>x{item.quantity}</ThemedText>
              <ThemedText style={s.itemPrice}>₹{item.price.toFixed(2)}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={s.cardFooter}>
        <View style={s.totalSection}>
          <ThemedText style={s.totalLabel}>Total</ThemedText>
          <ThemedText style={s.totalAmount}>₹{order.totalAmount.toFixed(2)}</ThemedText>
        </View>
        <TouchableOpacity style={s.viewDetailsButton}>
          <ThemedText style={s.viewDetailsText}>View Details</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const level = Object.entries(LEVELS).find(([_, data]) => (orders.ongoing.length + orders.history.length) >= data.threshold)?.[1] || LEVELS.BRONZE;

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ThemedView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconButton} onPress={() => auth.signOut().then(() => router.replace('/(auth)/welcome'))}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} tintColor="#FF6B00" />
          }
        >
          <View style={s.profileSection}>
            <ImageBackground 
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/500x200' }}
              style={s.coverPhoto}
              imageStyle={s.coverPhotoImage}
            >
              <View style={s.coverPhotoOverlay} />
              <TouchableOpacity onPress={handleImagePick} disabled={uploading} style={s.avatarContainer}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={s.avatar} />
                ) : (
                  <View style={s.avatarFallback}>
                    <Ionicons name="person" size={40} color="#FF6B00" />
                  </View>
                )}
                <View style={s.uploadOverlay}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
                {uploading && (
                  <View style={s.uploadingOverlay}>
                    <ThemedText style={s.uploadingText}>Uploading...</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </ImageBackground>

            <View style={s.profileInfo}>
              <View style={s.nameSection}>
                <ThemedText style={s.userName}>{user?.email || 'Foodie'}</ThemedText>
                <View style={s.levelBadge}>
                  <Ionicons name={level.icon as any} size={16} color={level.color} />
                  <ThemedText style={s.levelText}>{level.label}</ThemedText>
                </View>
              </View>
              <ThemedText style={s.userEmail}>{'Member since 2024'}</ThemedText>
            </View>

            <View style={s.statsGrid}>
              <View style={s.statItem}>
                <ThemedText style={s.statNumber}>{orders.ongoing.length + orders.history.length}</ThemedText>
                <ThemedText style={s.statLabel}>Total Orders</ThemedText>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <ThemedText style={s.statNumber}>{orders.ongoing.length}</ThemedText>
                <ThemedText style={s.statLabel}>Active Orders</ThemedText>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <ThemedText style={s.statNumber}>{orders.history.length}</ThemedText>
                <ThemedText style={s.statLabel}>Completed</ThemedText>
              </View>
            </View>
          </View>

          <View style={s.ordersSection}>
            {orders.ongoing.length > 0 && (
              <>
                <ThemedText style={s.sectionTitle}>Active Orders</ThemedText>
                {orders.ongoing.map(order => <OrderCard key={order.id} order={order} />)}
              </>
            )}

            <ThemedText style={s.sectionTitle}>Order History</ThemedText>
            {orders.history.length ? 
              orders.history.map(order => <OrderCard key={order.id} order={order} />) : 
              <View style={s.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#FFB700" />
                <ThemedText style={s.emptyText}>No orders yet</ThemedText>
              </View>
            }
          </View>

          <PolicySections />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
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
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA'
  },
  coverPhoto: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  coverPhotoImage: {
    opacity: 0.3, // Makes the background image slightly faded
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 107, 0, 0.1)', // Adds an orange tint
    zIndex: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5E6'
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
  },
  
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    zIndex: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF'
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF'
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
    backgroundColor: 'rgba(255,107,0,0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  profileInfo: {
    paddingTop: 48,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
    marginLeft: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666666'
  },
  ordersSection: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    marginTop: 8
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16
  },
  shopImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  orderInfo: {
    flex: 1
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  orderDate: {
    fontSize: 12,
    color: '#666666'
  },
  itemsList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 12
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  itemName: {
    fontSize: 14,
    color: '#000000',
    flex: 1
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000'
  },
  viewDetailsButton: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8
  }
});

export default ProfileScreen;