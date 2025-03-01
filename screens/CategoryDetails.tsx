import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';


const CategoryDetails = ({ route }) => {
  const { category } = route.params;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      try {
        const booksSnapshot = await firestore()
          .collection('livres')
          .where('genre', '==', category)
          .where('verdict', '==', 'accepted')
          .get();
        const booksList = booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksList);
      } catch (error) {
        console.error('Error fetching books by category:', error);
      } finally {
        setLoading(false); // Mettre à jour l'état de chargement
      }
    };

    fetchBooksByCategory();
  }, [category]);

  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity style={styles.bookContainer} onPress={() => handleBookPress(item)}>
        <FastImage 
          source={{ uri: item.coverUrl }} 
          style={styles.bookCover} 
          resizeMode={FastImage.resizeMode.cover}
          defaultSource={require('../assets/images/patientez.png')}
        />    
        <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.name}</Text>
        <Text style={styles.bookHeight}>{item.genre}</Text>
        <Text style={styles.bookSummary} numberOfLines={4}>{item.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={{ justifyContent: "center", alignItems: "center",flex:1 }}>
      <Image source={require('../assets/images/folder.png')} style={{ width: 120, height: 120, marginTop: "50%" }} />
      <Text style={{color:'black'}}>Aucun livre dans cette catégorie</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name='chevron-left' size={30} color={'black'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
      </View>

      {loading ? ( // Afficher le loader si en cours de chargement
        <View style={styles.loaderContainer}>
          <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
          <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBook}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop:40
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  bookContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  bookCover: {
    width: 120,
    height: 200,
    marginRight: 16,
    borderRadius: 6,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  bookHeight: {
    color: 'black',
    marginTop: 8,
  },
  bookSummary: {
    marginTop: 8,
    color: 'gray',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 100, // Ajuste la taille du loader si nécessaire
    height: 100,
  },
});

export default CategoryDetails;
