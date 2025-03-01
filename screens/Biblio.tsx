import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, FlatList, ActivityIndicator, Modal, Dimensions, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import RNFetchBlob from 'react-native-blob-util';
import { useAppContext } from '../AppContext';
import commonStyles from './stylesCommon';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import * as Progress from 'react-native-progress';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function FavoritesScreen() {
  const { sharedState } = useAppContext();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userReadBooks, setUserReadBooks] = useState([]);
  const [userDownloadedBooks, setUserDownloadedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('telecharge');
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [user, setUser] = useState(null);
  const [loadingCovers, setLoadingCovers] = useState(true);
  

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('livres')
      .onSnapshot(snapshot => {
        const booksList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksList);
        setLoadingCovers(false); // Indique que les couvertures sont chargées
        setLoading(false); // Assurez-vous de mettre à jour l'état après la récupération des livres
      }, error => {
        console.error('Erreur lors de la récupération des livres:', error);
        setLoading(false); // Assurez-vous de mettre à jour l'état même en cas d'erreur
      });
  
    // Retourner la fonction d'annulation pour nettoyer l'écouteur lorsque le composant est démonté
    return () => {
      unsubscribe();
    };
  }, []); // Exécuter une seule fois lorsque le composant est monté
  

  useEffect(() => {
    const fetchUserFavoritesRealtime = () => {
      const user = sharedState.user;
      if (user && user.uid) {
        const userRef = firestore().collection('users').doc(user.uid);
  
        // Ajouter un listener temps réel
        const unsubscribe = userRef.onSnapshot(
          (snapshot) => {
            if (snapshot.exists) {
              const userData = snapshot.data();
              setUserFavorites(userData.favorites || []);
              setUserReadBooks(userData.lues || []);
              setUserDownloadedBooks(userData.buyed || []);
            }
          },
          (error) => {
            console.error('Error listening to user data:', error);
          }
        );
  
        // Cleanup du listener pour éviter les fuites de mémoire
        return () => unsubscribe();
      }
    };
  
    return fetchUserFavoritesRealtime();
  }, [sharedState.user]);
  

  const handleBookPress = (book:String) => {
    navigation.navigate('BookDetails', { book });
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity onPress={() => handleBookPress(item)} style={styles.bookContainerIn}>
      <View style={{ flex: 0.4 }}>
        
          <FastImage
            style={commonStyles.bookCover}
            source={{
              uri: item.coverUrl,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
            defaultSource={require('../assets/images/patientez.png')}
          />       
      </View>
      <View style={{ flex: 0.6, paddingHorizontal: 15 }}>
        <Text style={commonStyles.bookTitle}>{item.name}</Text>
        <Text style={{ color: 'black', marginTop: 8 }}>{item.genre}</Text>
        <Text style={styles.bookSummary} numberOfLines={3}>{item.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={{justifyContent:"center",alignItems:"center",flex:1}}>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/empty.json')} autoPlay loop />
        <Text style={{color:'black'}}>Aucun livre dans cette section</Text>
    </View>
  );

  const filteredBooks = (() => {
    switch (activeTab) {
      case 'favories':
        return books.filter(book => userFavorites.includes(book.id));
      case 'lues':
        return books.filter(book => userReadBooks.includes(book.id));
      case 'telecharge':
        return books.filter(book => userDownloadedBooks.includes(book.id));
      default:
        return [];
    }
  })();

  if (loading) { 
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
    </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View >
          <Text style={styles.headerTitle}>Bibliothèque</Text>
          <Text style={styles.headerUnderline}></Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('profile')}>
        <Image
         source={user.image && user.image.length > 0 
          ? { uri: user.image } 
          : require('../assets/images/auteur.png')}
          style={styles.profileImage}
        />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'telecharge' && styles.activeTab]}
          onPress={() => setActiveTab('telecharge')}
        >
          <Text style={[styles.tabText, activeTab === 'telecharge' && styles.activeTabText]}>Mes livres</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lues' && styles.activeTab]}
          onPress={() => setActiveTab('lues')}
        >
          <Text style={[styles.tabText, activeTab === 'lues' && styles.activeTabText]}>Mes lectures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favories' && styles.activeTab]}
          onPress={() => setActiveTab('favories')}
        >
          <Text style={[styles.tabText, activeTab === 'favories' && styles.activeTabText]}>Mes favoris</Text>
        </TouchableOpacity>
      </View>


      {loading ? ( // Afficher le loader si en cours de chargement
        <View style={styles.loaderContainer}>
          <Image source={require('../assets/images/loading.gif')} style={styles.loader} />
          <Text>Patientez...</Text>
        </View>
      ) : (
      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        renderItem={renderBook}
        contentContainerStyle={styles.bookList}
        ListEmptyComponent={renderEmptyList}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bookList: {
    padding: 10,
  },
  bookContainerIn: {
    margin: 5,
    flexDirection: 'row',
    width: '100%',
    height: 220,
    borderBottomColor: "lightgray",
    borderBottomWidth: 0.5,
  },
  skeletonBookCover: {
    backgroundColor: '#e0e0e0',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0cc0df',
  },
  tabText: {
    fontSize: 16,
    color: 'black',
  },
  activeTabText: {
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  tab1: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  tab2: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  tab3: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    padding: 6,
  },
  favButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  readButton: {
    backgroundColor: 'lightblue',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: 200,
  },
  readButtonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  bookSummary: {
    width: '100%',
    marginTop: 11,
    color: 'gray',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  header: {
    justifyContent: 'space-between',
    height: 70,
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgray',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 40
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  headerUnderline: {
    width: 70,
    borderColor: "#0cc0df",
    borderTopWidth: 4,
    height: 0,
    borderRadius: 50,
  },
  profileButton: {
    backgroundColor: '#f5f5f5',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
