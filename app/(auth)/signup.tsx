import { StyleSheet, Dimensions,Alert, Text, View,Platform, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import React,{useEffect, useState} from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
const heights = Dimensions.get('screen').height
import {
createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
  } from 'firebase/auth';
  import { auth, firestore } from '../../components/firebase/firebase';
const signup = () => {
 const auth = getAuth();

    const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
    
      // Animation values
     const handleEmailSignIn = async()=>{

    setLoading(true);
          if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;}

            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            
            if (userCredential.user) {
                
                console.log(userCredential.user)
            
              }

    
}
     
      const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  return (
<ScrollView showsVerticalScrollIndicator={false}>
  <View style={{height:heights, flex:1, paddingTop:100,  paddingHorizontal:20}}>
  <LinearGradient
        colors={['#1338be', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
     
              
              <ThemedText type="title" style={styles.title}>
                FOST
              </ThemedText>
  <View style={{alignItems:'center', justifyContent:'space-around', flexDirection:'row', paddingVertical:14}}>
          <ThemedText type='link' style={styles.subtitle}>
            Don't have account ! do provide your email and pw to get started! 
          </ThemedText>
          </View>

           <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </View>
                    
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                      />
                    </View>
          </View>
  


            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton, {marginVertical:20}]}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              <MaterialIcons name="email" size={24} color="#fff" />
             
              <ThemedText style={styles.buttonText}>
                Sign Up  with Email
              </ThemedText>
            </TouchableOpacity>



            <View style={{marginTop:30}}>
      <Link href={'/(auth)/welcome'}>
  
  <ThemedText style={{  fontSize: 16,
      color: '#666',
      textAlign: 'center',
      
      }}>
     Signin instead 
    </ThemedText>
                </Link>
        </View>


         <View style={{margin:20, alignItems:'center'}}>
              <ThemedText style={styles.terms}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </ThemedText>
              </View>  
  </View>

</ScrollView>
  )
}

export default signup

const styles = StyleSheet.create({
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.1,
       
      },

      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      disabledButton: {
        opacity: 0.6,
      },
      logo: {
        width: 120,
        height: 120,
        marginBottom: 24,
        borderRadius: 60,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        margin:10
      },
      title: {
        fontSize: 32,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1338be',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      subtitle: {
    
        fontSize: 16,
        color: '#1338be',
        textAlign: 'center',
        maxWidth: '80%',
      },
      inputContainer: {
        gap: 16,
      },
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginVertical:6,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
      inputIcon: {
        marginRight: 12,
      },
      input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#333',
      },
      button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1338be',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      },
      terms: {
        padding:20,
    
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
      },
})