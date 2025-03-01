import { Alert, Button, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
//import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-root-toast';
import { useAppContext } from '../AppContext';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyTextInput from './components/MyTextInput';
import MyButton from './components/MyButton';



export default function LoginScreen({ navigation }) {
  const { setSharedState, sharedState } = useAppContext();
  const [isKeyboardVisible, setKeyboardVisible] = useState(true);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '232506897629-hies7jq03t5dv1fmhltpbmd5325s47m5.apps.googleusercontent.com',
    });

    // Vérifiez si l'utilisateur est déjà connecté
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setSharedState({ user: JSON.parse(user) });
        navigation.replace('home');
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    // Ajouter les écouteurs pour détecter quand le clavier s'affiche ou se cache
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // Met à jour l'état pour indiquer que le clavier est visible
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // Met à jour l'état pour indiquer que le clavier est caché
    });

    // Nettoie les écouteurs quand le composant est démonté
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const checkIfUserIsActive = async (uid) => {
    const userDoc = firestore().collection('users').doc(uid);
    const userSnapshot = await userDoc.get();
    if (userSnapshot.exists) {
      const userData = userSnapshot.data();
      console.log('utilisateur actif')
      return userData.isConnected;
      
    }
    return false;
    
  };

  

  const EmailLogin = () => {
    if(email!= "" && password!==""){
      auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        // Si l'authentification est réussie
        const userId = userCredential.user.uid; // Récupère l'ID de l'utilisateur
        console.log("ID de l'utilisateur connecté :", userId);
        
        // Vérifier si l'utilisateur est déjà actif
        const isActive = await checkIfUserIsActive(userId);
        if (isActive) {
          // Afficher un toast et renvoyer l'utilisateur à l'écran de connexion
          Alert.alert('Votre compte est utilisé ailleurs, veuillez le déconnecter d\'abord.');
          navigation.navigate('login'); // Redirection vers l'écran de connexion
        }
        else{
          const userInfo = {
            uname: '',
            adresse: email,
            uid: userId,
            image: '',
          };
    
          // Enregistrer les informations utilisateur dans AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userInfo));
          AsyncStorage.setItem('showModal', JSON.stringify(true)) // Ajouter showModal avec la valeur true dans AsyncStorage

    
          setSharedState((prevState) => ({
            ...prevState,
            user: userInfo,
          }));
    
          // Mettre à jour le champ `isConnected` à true dans Firestore
          const userDoc = firestore().collection('users').doc(userId);
          await userDoc.set(
            {
              isConnected: true, // Marquer comme actif
            },
            { merge: true }
          );
    
          navigation.replace('home');
        }
        
      })
      .catch((error) => {
        // Gérer les erreurs possibles
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Vous n\'êtes pas enregistré, veuillez le faire !');
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert('Mot de passe incorrect !');
        } else {
          Alert.alert('Une erreur est survenue. Veuillez réessayer.');
        }
        console.error(error);
      });
    }else{
      Alert.alert('Veillez entrer vos informations de connexion Merci.');
    }
    
  };
  

 

  async function onGoogleButtonPress() {
    try {
        Toast.show('Vérification des services Google...');
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        Toast.show('Connexion avec Google en cours...');
        const { idToken, user } = await GoogleSignin.signIn();

        Toast.show('Authentification en cours...');
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);

        const { uid } = userCredential.user;

        Toast.show('Vérification de l\'état de l\'utilisateur...');
        const userDoc = await firestore().collection('users').doc(uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            if (userData.isConnected) {
                Toast.show('Déconnexion de l\'autre appareil...');
                // Déconnecter l'utilisateur sur l'autre appareil
                await firestore().collection('users').doc(uid).update({
                    isConnected: false,
                });
            }
        }

        const userInfo = {
            uname: user.name,
            adresse: user.email,
            uid: uid,
            image: user.photo,
        };

        Toast.show('Connexion réussie !');
        navigation.replace('home');

        await Promise.all([
            AsyncStorage.setItem('user', JSON.stringify(userInfo)),
            firestore().collection('users').doc(uid).set({
                name: user.name,
                image: user.photo,
                email: user.email,
                biblio: [],
                favories: [],
                telecharge: [],
                isConnected: true,
                id: uid
            }, { merge: true }),
            AsyncStorage.setItem('showModal', JSON.stringify(true)) 
        ]);

        setSharedState((prevState) => ({
            ...prevState,
            user: userInfo,
        }));

        Toast.show('Enregistrement des données terminé !');
    } catch (error) {
        Toast.show('Erreur lors de la connexion, veuillez réessayer.');
        console.error('Error signing in with Google:', error);
    }
}


  
/*
  async function onFacebookButtonPress() {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw 'Something went wrong obtaining access token';
      }

      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await auth().signInWithCredential(facebookCredential);

      const { uid } = userCredential.user;
      const user = userCredential.user;


      const isActive = await checkIfUserIsActive(uid);
      if (isActive) {
        Toast.show('User is already active!');
        return;
      }

      const userInfo = {
        uname: user.displayName,
        adresse: user.email,
        uid: uid,
        image: user.photoURL,
      };


      await AsyncStorage.setItem('user', JSON.stringify(userInfo));

      setSharedState((prevState) => ({
        ...prevState,
        user: userInfo,
      }));


      const userDoc = firestore().collection('users').doc(uid);
      await userDoc.set({
        name: user.displayName,
        image: user.photoURL,
        email: user.email,
        biblio: [],
        favories: [],
        lues: [],
        telecharge: [],
        isConnected: true,
      }, { merge: true });

      navigation.navigate('home');
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
    }
  }*/
  return (
      <View style={{flex:1,alignItems:'center',backgroundColor:'#ffffff'}}>
        <ImageBackground style={{flex:0.4,width:'100%'}} source={require('../assets/images/intro.jpg')}>

        </ImageBackground>
        <Image style={{width:100,height:100,borderRadius:50,marginTop:-50}} source={require('../assets/images/logo.jpg')}/>
        <View style={{flex:1,width:'80%',paddingTop:32}}>
          
          <View style={{ marginBottom: 24,width:'100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
              Email
              </Text>
              <TextInput
              value={email} 
              onChangeText={text => setEmail(text)}
              placeholder="Entrer l'email"
              style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black',padding:8 }}
              />
          </View>
          <View style={{ marginBottom: 24,width:'100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
              mot de passe
              </Text>
              <TextInput
              secureTextEntry
              value={password}
              onChangeText={text => setPassword(text)}
              placeholder="mot de passe"
              style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black',padding:8 }}
              />
          </View>
          <TouchableOpacity style={{marginBottom:12}} onPress={()=>navigation.navigate('signup')}>
           <Text style={{alignSelf:'flex-end',color:'#1877F2',textDecorationLine:'underline'}}>Pas encore de compte</Text>
          </TouchableOpacity>
          <View style={{marginTop:32,flex:0.5}}>
            <MyButton onPress={EmailLogin} title="Se connecter"/>
            <TouchableOpacity onPress={onGoogleButtonPress} style={styles.googleButton}>
               <Image style={styles.googleIcon} source={require('../assets/images/google.png')} />
               <Text style={{ marginLeft: 20, color: 'black', fontSize: 16 }}>Continuer avec Google</Text>
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', fontSize: 11, color: 'black',marginTop:24 }}>
             En continuant, vous acceptez les conditions d'utilisation de Papers et reconnaissez avoir lu notre
             politique de confidentialité.
           </Text>
          </View>
          
        </View>
      </View>
    
  );
}

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
    justifyContent:'center',
    marginTop:32
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
