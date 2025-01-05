import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const width = Dimensions.get('screen').width
import { useLocalSearchParams, router } from 'expo-router';
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
const Showcart = () => {
const [iscart, setIscart] = useState(false)
const [length, setLength] = useState(0)

  useEffect(()=>{
    loadCartItems()
  },[])
  useEffect(() => {
    const getCartCount = async () => {
      try {
        const cartString = await AsyncStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);
          setLength(count);
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
  const loadCartItems = async () => {
    try {
      const cartString = await AsyncStorage.getItem('cart');
      
      if (cartString) {
        const items = JSON.parse(cartString);
        const cart = JSON.parse(cartString);
          const count = cart.reduce((total: number, item: CartItem) => total + item.quantity, 0);

        setLength(count)
      setIscart(true)
      }
      
    } catch (error) {
      console.error('Error loading cart:', error);
      
    }
  };
 
const cartpressed =()=>{
router.push('/Mis/cart')
}

  return (
   <>
   {length>0 && (
    <>
    <TouchableOpacity onPress={()=>cartpressed()} style={{position:'absolute', zIndex:1,  bottom:5,  alignSelf:'center', backgroundColor:'#fc8019', height:80, width:width*0.9, borderRadius:20,  borderWidth:1, borderColor:'#fc8019', }}>
     <View style={{ flexDirection:"row", justifyContent:'space-evenly', alignItems:'center', padding:10 }}>
     <Ionicons style={{position:'fixed'}} name="cart-sharp" size={35} color='white' />
<View>
<Text style={{fontSize:18, fontWeight:"700", color:'white'}}>Procced to cart</Text>
</View>
   
<View style={{alignItems:'center', height:50, backgroundColor:'red', borderRadius:10, width:80}}>
  <Text style={{fontSize:15, fontWeight:'600', color:'white'}}>
    View cart
  </Text>
  <Text style={{fontSize:12, color:'white'}}>
    {length} items
  </Text>
</View>
     </View>
      
    </TouchableOpacity>
    </>

   )}
   </>
   
    
)
}

export default Showcart

const styles = StyleSheet.create({
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
})