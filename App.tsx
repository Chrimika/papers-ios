/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/Home';
import Me from './screens/Me';
//import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './screens/Login';
import { AppProvider } from './AppContext';
import UploadBook from './screens/Upload';
import PdfViewer from './screens/PdfViewer';
import Read from './screens/Read';
//import CategoriesScreen from './screens/Categories';
import Splash from './screens/SplashScreen';
import FavoritesScreen from './screens/Biblio';
import OnBoardScreen from './screens/OnBoarding';
import OnBoardingItemsScreen from './screens/OnBoardingItems';
import ProfileScreen from './screens/Profile';
import DiscoverScreen from './screens/Categories';
import CollectionDetails from './screens/CollectionDetails';
import BookDetails from './screens/BookDetails';
import CategoryDetails from './screens/CategoryDetails';
import SubscriptionScreen from './screens/SignUp';
import BuyBookScreen from './screens/BuyBook';
import PaymentWebViewScreen from './screens/PaymentWebViewScreen';
import LandingScreen from './screens/Landing';


const Stack = createNativeStackNavigator();

const Routes = () => {
  /*useEffect(() => {
    setTimeout(()=>{
      SplashScreen.hide()
    },1500)
  })*/
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='login'>
          <Stack.Screen
            name="home"
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="splash" component={Splash} options={{headerShown: false}}/>
          <Stack.Screen name="intro" component={LandingScreen} options={{headerShown: false}}/>
          <Stack.Screen name="me" component={Me} options={{headerShown: false}}/>
          <Stack.Screen name="login" component={LoginScreen} options={{headerShown: false}}/>
          <Stack.Screen name="upload" component={UploadBook} options={{headerShown: false}}/>
          <Stack.Screen name="pdfviewer" component={PdfViewer} options={{headerShown: false}}/>
          <Stack.Screen name="read" component={Read} options={{headerShown: false}}/>
          {/*<Stack.Screen name="cat" component={CategoriesScreen} options={{headerShown: false}}/>*/}
          <Stack.Screen name="fav" component={FavoritesScreen} options={{headerShown: false}}/>
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
export default Routes;