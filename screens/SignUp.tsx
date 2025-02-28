import { Alert, Image, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import MyButton from './components/MyButton'
import MyTextInput from './components/MyTextInput'
//import auth from "@react-native-firebase/auth"
//import { te } from 'date-fns/locale'
//import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAppContext } from '../AppContext'
//import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-root-toast'


const SubscriptionScreen = ({navigation}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { setSharedState, sharedState } = useAppContext();

    const SignUpTest = () => {
        /*
        if(email!=='' && password!==''){
            if(password === confirmPassword)
                {
                    auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(async (userCredential) => {
                      // Récupération de l'UID de l'utilisateur nouvellement créé
                      const uid = userCredential.user.uid;
                      console.log('User UID:', uid);
                      Alert.alert('User created');
    
                      const userInfo = {
                        uname: "",
                        adresse: email,
                        uid: uid,
                        image: "",
                      };
    
                      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
                      setSharedState((prevState) => ({
                        ...prevState,
                        user: userInfo,
                      }));
    
                    const userDoc = firestore().collection('users').doc(uid);
                    await userDoc.set({
                        id:uid,
                        name: '',
                        image: '',
                        email: email,
                        biblio: [],
                        favories: [],
                        telecharge: [],
                        isConnected: true, // Marquer comme actif
                    }, { merge: true });
    
                    navigation.replace('onboard');
                    Toast.show('création réussie avec succès')
                    })
                    .catch((err) => {
                      console.log(err);
                    });
            }
            else{
                Alert.alert('Mot de passe different')
            }
            
        }else{
            Alert.alert('Veillez entrer vos informations de connexion Merci.')
        }*/
        
    }

  return (
    <View style={styles.container}>
      <View style={{flex:0.3,width:'100%',backgroundColor:'#0cc0df',justifyContent:'center',alignItems:'center',borderBottomRightRadius:30, borderBottomLeftRadius:30,}}>
            <Image style={{ width: '100%', height: '100%', borderBottomRightRadius: 30, borderBottomLeftRadius: 30 }} source={require('../assets/images/intro.jpg')} resizeMode="cover" />
            {/* <LinearGradient 
              colors={['transparent', 'rgba(255,255,255,1)']} 
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10%' }} 
            /> */}
      </View>
      <Image 
        style={{ 
          width: 100, 
          height: 100, 
          borderRadius: 125, // La moitié de la taille pour obtenir un cercle
          overflow: 'hidden',
          marginTop:-70, // Assure que l'image ne dépasse pas du conteneur circulaire
          flex:0.11
        }} 
        source={require('../assets/images/logo.jpg')} 
        resizeMode="cover" 
      />
      <View style={{justifyContent:"center",alignItems:'center',marginTop:20,flex:0.1}}>
        <Text style={{fontSize:26,fontWeight:'bold',color:'black'}}>Enregistrement</Text>
      </View>
      <View style={{flex:0.4,width:'80%',paddingVertical:18}}>
        <Text style={{color:'black'}}>Email</Text>
        <MyTextInput value={email} onChangeText={() => {}} placeholder="Entrer l'email"/>
        <Text style={{color:'black'}}>Mot de passe</Text>
        <MyTextInput value={password} onChangeText={() => {}} placeholder='mot de passe' secureTextEntry/>
        <Text style={{color:'black'}}>Confirmer</Text>
        <MyTextInput value={confirmPassword} onChangeText={() => {}} placeholder='Confirmer mot de passe' secureTextEntry/>
        <TouchableOpacity onPress={()=>navigation.navigate('login')}>
            <Text style={{alignSelf:'flex-end',marginRight:10,marginBottom:15,textDecorationLine:'underline',color:'black'}}>Deja un compte</Text>
        </TouchableOpacity> 
        <View style={{marginTop:22}}>
          <MyButton title="S'enregistrer" onPress={SignUpTest}/>
        </View>
      </View>
    </View>
  )
}

export default SubscriptionScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      alignItems:'center'
    },
    img: {
      justifyContent: 'center',
      width:"100%"
    },
    boutons: {
      flex: 0.5,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      width: '80%',
      marginTop:-15
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderColor: '#000000',
      borderRadius:10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      width: '100%',
      bottom: 40,
      justifyContent:'center'
    },
    googleIcon: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    facebookButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1877F2',
      borderColor: '#dddddd',
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 20,
      width: '100%',
      bottom: 30,
    },
  });
  