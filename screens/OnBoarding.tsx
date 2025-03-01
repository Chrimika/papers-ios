// import liraries
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated, TouchableOpacity, Text } from 'react-native';
import Slides from './Slides';
import OnBoardingItemsScreen from './OnBoardingItems';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../AppContext';



// create a component
const OnBoardScreen = ({ navigation }) => {

    

    const { width } = Dimensions.get('window');
    const { setSharedState, sharedState } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;
    
    const viewConfig = useRef({
        viewAreaCoveragePercentThreshold: 50
    }).current;


    useEffect(() => {
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
    

    return (
        <View style={styles.container}>
            <View style={{ flex: 3 }}>
                <FlatList
                    data={Slides}
                    renderItem={({ item }) => <OnBoardingItemsScreen item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator
                    pagingEnabled
                    keyExtractor={(item) => item.id.toString()}
                    style={{ width }}
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    scrollEventThrottle={32}
                    ref={slidesRef}
                />
            </View>
            
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    
});

// make this component available to the app
export default OnBoardScreen;
