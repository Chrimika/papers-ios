/* eslint-disable prettier/prettier */
import React, { useEffect, Suspense } from 'react';
import { Text, View, ActivityIndicator, Alert, Linking, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './screens/Login';
import { AppProvider } from './AppContext';
import UploadBook from './screens/Upload';
import PdfViewer from './screens/PdfViewer';
import Read from './screens/Read';
import Splash from './screens/SplashScreen';
import FavoritesScreen from './screens/Biblio';
import OnBoardScreen from './screens/OnBoarding';
import OnBoardingItemsScreen from './screens/OnBoardingItems';
import ProfileScreen from './screens/Profile';
import DiscoverScreen from './screens/Categories';
import CollectionDetails from './screens/CollectionDetails';
import BookDetails from './screens/BookDetails';
import CategoryDetails from './screens/CategoryDetails';
import SubscriptionScreen from './screens/Subscription';
import BuyBookScreen from './screens/BuyBook';
import PaymentWebViewScreen from './screens/PaymentWebViewScreen';
import LandingScreen from './screens/Landing';
import SignUp from './screens/SignUp';
import { createBottomTabNavigator, TransitionSpecs } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
//import { SharedTransition, withSpring } from 'react-native-reanimated';
//import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
//import PushNotification from 'react-native-push-notification';
//import PdfTextExtractor from './screens/PdfVoice';




const HomeScreen = React.lazy(() => import('./screens/Home'));
const CategoriesScreen = React.lazy(() => import('./screens/Categories'));

const navigationRef = React.createRef();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/*
PushNotification.createChannel(
  {
    channelId: "default-channel-id",
    channelName: "Default Channel", 
    channelDescription: "Canal utilisé pour les notifications générales",
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Canal créé : ${created}`)
)

// Configuration des notifications locales
PushNotification.configure({
  onNotification: function (notification) {
    console.log('Notification received:', notification);
  },

  // Autorisations pour iOS (pas nécessaire pour Android)
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
  requestPermissions: true,
});

function showNotification(data) {
  PushNotification.localNotification({

    channelId: "default-channel-id", // ID du canal que vous devez configurer
    title: data.notification?.title || 'Nouvelle notification', // Titre
    message: data.notification?.body || 'Vous avez une notification', // Message
    playSound: true, // Activer le son
    soundName: "default", // Son par défaut
    importance: "high", // Importance élevée pour la priorité
    vibrate: true, // Activer la vibration

    group: "group", // Regrouper les notifications
  });
}

// Exemple de données reçues depuis Firebase
const firebaseData = {
  collapseKey: "com.seedsoftengine.papers",
  data: {},
  from: "232506897629",
  messageId: "0:1733037260310897%c93002abc93002ab",
  notification: {
    android: {},
    body: "Hello from papers",
    title: "Hello",
  },
  originalPriority: 1,
  priority: 1,
  sentTime: 1733037260300,
  ttl: 2419200,
};

// Affichez la notification



export const NotificationListener = () => {
  // Lorsque l'application est en arrière-plan et qu'une notification est ouverte
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state: ',
      remoteMessage.notification,
    );
    // Afficher la notification
    displayNotification(remoteMessage.notification);
  });

  // Lorsque l'application est fermée et qu'une notification est cliquée
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        // Afficher la notification
        displayNotification(remoteMessage.notification);
      }
    });

  // Lorsque l'application est au premier plan
  messaging().onMessage(async remoteMessage => {
    console.log('Notification in foreground state.....', remoteMessage);

    // Afficher la notification en premier plan
    if (remoteMessage.notification) {
      showNotification(remoteMessage.notification);
    }
  });
};

// Fonction pour afficher une notification locale
const displayNotification = (notification) => {
  PushNotification.localNotification({
    channelId: "default-channel-id", // ID du canal
    title: notification.title || "Nouvelle notification", // Titre
    message: notification.body || "Vous avez une notification", // Message
    playSound: true, // Activer le son
    soundName: "default", // Son par défaut
    importance: "high", // Importance élevée
    vibrate: true, // Activer la vibration
  });
};

*/

const Routes = () => {
  /*
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }
  
  const getToken = async() => {
    const token = await messaging().getToken()
    console.log("Token = ",token)
  }
  
  useEffect(() => {
    // Masquer l'écran de chargement Splash après 1.5 seconde
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
    // requestUserPermission()
    // getToken()
  }, []);*/

  function MyTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          animation:"fade",
          tabBarIcon: ({ color }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = 'home';
            } else if (route.name === 'Découvrez') {
              iconName = 'compass';
            } else if (route.name === 'Bibliothèque') {
              iconName = 'bookmark';
            } else if (route.name === 'profile') {
              iconName = 'user';
            }

            return (
              <View style={styles.iconContainer}>
                <Feather name={iconName} size={18} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: '#0cc0df',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#f9f9f9' },
          tabBarHideOnKeyboard:true,
          tabBarButton: (props) => (
            <TouchableWithoutFeedback
              onPress={props.onPress}
              accessibilityRole="button"
              accessible
            >
              <View style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>{props.children}</View>
            </TouchableWithoutFeedback>
          ),
          
        })}
        
      >
        <Tab.Screen  name="Accueil" component={HomeScreen} options={{ headerShown: false}} />
        <Tab.Screen name="Découvrez" component={DiscoverScreen} options={{headerShown: false}}/>
        <Tab.Screen name="Bibliothèque" component={FavoritesScreen} options={{headerShown: false}}/>
        <Tab.Screen name="profile" component={ProfileScreen} options={{headerShown: false}}/>
        </Tab.Navigator>
    );
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='onboard'>
          <Stack.Screen
            name="home"
            options={{ headerShown: false }}
            component={MyTabs}
          >
          </Stack.Screen>
          <Stack.Screen
            name="cat"
            options={{ headerShown: false }}
          >
            {() => (
              <Suspense
                fallback={
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0cc0df" />
                  </View>
                }
              >
                <CategoriesScreen />
              </Suspense>
            )}
          </Stack.Screen>
          <Stack.Screen name="splash" component={Splash} options={{headerShown: false}}/>
          <Stack.Screen name="intro" component={LandingScreen} options={{headerShown: false}}/>
          <Stack.Screen name="login" component={LoginScreen} options={{headerShown: false}}/>
          <Stack.Screen name="signup" component={SignUp} options={{headerShown: false}}/>
          <Stack.Screen name="upload" component={UploadBook} options={{headerShown: false}}/>
          <Stack.Screen name="pdfviewer" component={PdfViewer} options={{headerShown: false}}/>
          <Stack.Screen name="read" component={Read} options={{headerShown: false}}/>
          <Stack.Screen name="fav" component={MyTabs} options={{headerShown: false}}/>
          <Stack.Screen name="onboard" component={OnBoardScreen} options={{headerShown: false}}/>
          <Stack.Screen name="profile" component={ProfileScreen} options={{headerShown: false}}/>
          <Stack.Screen name="item" component={DiscoverScreen} options={{headerShown: false}}/>
          <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{headerShown: false}}/>
          <Stack.Screen name="BookDetails" component={BookDetails} options={{headerShown: false}}/>
          <Stack.Screen name="CategoryDetails" component={CategoryDetails} options={{headerShown: false}}/>
          <Stack.Screen name="sub" component={SubscriptionScreen} options={{headerShown: false}}/>
          <Stack.Screen name="buy" component={BuyBookScreen} options={{headerShown: false}}/>
          <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,   // Largeur pour l'icône
    height: 40,  // Hauteur pour l'icône
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#0cc0df',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
});

export default Routes;
