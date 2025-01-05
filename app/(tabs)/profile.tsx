import { ActivityIndicator, StyleSheet, Text, View, Dimensions } from 'react-native'
import React, {useState, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
const height = Dimensions.get('screen').height
const Profile = () => {
  const [email, setEmail] = useState("")
  const [loading, isLoading] = useState(false)
  useEffect(()=>
  {
    const userEmail = async()=>{
      const user = await AsyncStorage.getItem('user');
      const ram = JSON.parse(user)

  setEmail(ram.email)
  isLoading(true)
    }
  
    userEmail()
  },[])
 

  return (
    <View style={{flex:1}}>
      {!loading && (
        <View style={{flex:1, alignItems:'center', justifyContent:'center',  alignSelf:'center'}}>
        <ActivityIndicator size={80} color='#fc8019'/>
        <Text style={{fontSize:16, fontWeight:'900', color:'#fc8019'}}>Loading</Text>
        </View>
      )}
      {loading && (
        <>
<View style={{paddingTop:40, paddingHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
  <View>
    <Text style={{fontSize:16, fontWeight:'500', color:'#fc8019'}}>
{email}
    </Text>
  </View>
  <View style={{backgroundColor:'#fc8019', height:80, width:80, alignItems:'center', justifyContent:'center', borderRadius:40}}>
    <Text style={{color:'white', fontSize:56, fontWeight:'700', alignSelf:'center'}}>
      {email.split("")[0]}
    </Text>
  </View>
</View>
        </>
      )}
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})