// import libraries
import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyButton from './components/MyButton';

// create a component
const OnBoardingItemsScreen = ({ item }) => {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    const handleSkip = () => {
        navigation.navigate('login');
    };

    return (
        <View style={[styles.container, { width }]}>
            <Image source={item.image} style={[styles.image, { width, resizeMode: 'cover' }]} />  
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={styles.footer}>
                <MyButton onPress={handleSkip} title='Continuer'/>
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
    },
    image: {
        flex: 1,
        justifyContent: 'center',
        borderBottomLeftRadius:20,
        borderBottomRightRadius:20,
    },
    textContainer: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: '800',
        fontSize: 28,
        color: '#493d8a',
        textAlign: 'center',
    },
    description: {
        fontWeight: '300',
        marginTop: 10,
        color: '#62656b',
        textAlign: 'center',
    },
    footer: {
        flex: 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        paddingVertical:15
    },
    skipButton: {
        backgroundColor: '#f00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    skipButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

// make this component available to the app
export default OnBoardingItemsScreen;
