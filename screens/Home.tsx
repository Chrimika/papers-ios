import React, { useEffect, useState, useRef } from 'react';
import { View,RefreshControl, Text, TouchableOpacity, Image, ScrollView, StyleSheet, FlatList, ActivityIndicator, Dimensions, BackHandler, StatusBar, Linking, LogBox } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { useAppContext } from '../AppContext';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

LogBox.ignoreAllLogs();


const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { sharedState } = useAppContext();
  const [books, setBooks] = useState([]);
  const [booksCaroussel, setBooksCaroussel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [isRatingModalVisible, setRatingModalVisible] = useState(true);
  const [isAuthorModalVisible, setAuthorModalVisible] = useState(false); 
  const [carousselAuto, setCarousselAuto] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false); 

  useEffect(() => {
    const checkShowModal = async () => {
      try {
        const showModal = await AsyncStorage.getItem('showModal');
        if (showModal === 'true') {
          // Met à jour showModal à false
          await AsyncStorage.setItem('showModal', JSON.stringify(false));
          // Active le modal de notation
          setRatingModalVisible(true);
        } else if (showModal === 'false') {
          // Si showModal est false, mettez le modal de notation à false
          setRatingModalVisible(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de showModal:', error);
      }
    };
  
    checkShowModal();
  }, []);

  useEffect(() => {
  const fetchCarousselAutoStatus = async () => {
    try {
      // Accéder au document unique dans la collection "global"
      const docSnapshot = await firestore()
        .collection('global')
        .doc('settings') // Remplace par l'ID du document
        .get();

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data && typeof data.carousselAuto === 'boolean') {
          // Mettre à jour carousselAuto avec la valeur de la base de données
          setCarousselAuto(data.carousselAuto);
          console.log();

        } else {
          console.warn("L'attribut carousselAuto est manquant ou mal formaté dans la BD.");
        }
      } else {
        console.warn("Le document global est introuvable.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'attribut carousselAuto :", error);
    }
  };

  fetchCarousselAutoStatus();

  // Pas besoin d'un retour ici car on ne met pas de listener permanent
}, []);
  

const fetchBookData = () => {
  try {
    setIsImageLoaded(false); // Réinitialiser le chargement avant de commencer la récupération
    const unsubscribe = firestore()
      .collection('livres')
      .doc(books?.id) // Vérifie si un ID de livre est défini
      .onSnapshot(bookDoc => {
        if (bookDoc.exists) {
          setBooks(bookDoc.data()); // Met à jour l'état avec les nouvelles données
          setIsImageLoaded(true); // Marque le chargement terminé après la mise à jour des données
        } else {
          console.warn("Le document n'existe pas.");
          setIsImageLoaded(true); // Même en cas d'absence de données, le chargement est terminé
        }
      });

    return unsubscribe; // Retourne la fonction d'annulation pour nettoyer l'écouteur
  } catch (error) {
    console.error("Erreur lors de la récupération des données : ", error);
    setIsImageLoaded(true); // Assure que l'état de chargement est réinitialisé même en cas d'erreur
  }
};

  

  const onRefresh = async () => {
    setRefreshing(true);
    fetchBookData();
    // Simule une action de rafraîchissement (par exemple, récupérer les données à nouveau)
    setTimeout(() => {
      // Ici, tu peux appeler une fonction pour rafraîchir les données
      console.log("Données rafraîchies");
      setRefreshing(false); // Arrêter le spinner de rafraîchissement
    }, 2000); // Par exemple, attendre 2 secondes
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('livres')
      .where('verdict', '==', 'accepted')
      .onSnapshot(snapshot => {
        // Mapper les documents et filtrer pour mettre à jour les deux états
        const booksList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Met à jour l'état des livres principaux
        setBooks(booksList);
  
        // Filtre les livres pour ceux avec inCaroussel == "yes"
        const booksInCaroussel = booksList.filter(book => book.inCaroussel === "yes");
  
        // Met à jour l'état des livres du caroussel
        setBooksCaroussel(booksInCaroussel);
  
        setLoading(false);
      }, error => {
        console.error('Erreur lors de la récupération des livres:', error);
        setLoading(false);
      });
  
    // Retourner la fonction d'annulation pour nettoyer l'écouteur lorsque le composant est démonté
    return () => {
      unsubscribe();
    };
  }, []);
  
  

  useEffect(() => {
    const data = carousselAuto ? booksCaroussel : books;

    if (data.length > 0) { 
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [books, booksCaroussel, carousselAuto]);

  useEffect(() => {
    const data = carousselAuto ? booksCaroussel : books;

    if (flatListRef.current && data.length > 0) { // Vérifie que le tableau de données n'est pas vide
      flatListRef.current.scrollToIndex({ animated: true, index: currentIndex });
    }
  }, [currentIndex, books, booksCaroussel, carousselAuto]);

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; 
      }
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);

  const clearLocalPDFData = async () => {
    try {
      // Récupérer toutes les clés
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filtrer les clés liées aux PDF des livres
      const pdfKeys = allKeys.filter(key => key.endsWith('_pdfPath'));
      
      if (pdfKeys.length > 0) {
        // Supprimer les clés sélectionnées
        await AsyncStorage.multiRemove(pdfKeys);
        console.log(`Cleared ${pdfKeys.length} local PDF entries:`, pdfKeys);
      } else {
        console.log('No local PDF data found.');
      }
    } catch (error) {
      console.error('Error clearing local PDF data:', error);
    }
  };

  useEffect(() => {
    // Exécute une fois lorsque le composant est monté
    clearLocalPDFData();
  }, []);

  const openAuthorPage = () => {
    Linking.openURL('https://papers.seedsoftengine.com/Landing-auteurs/');
  };

  const handlePress = async (book) => {
    // Naviguer vers BookDetails immédiatement
    navigation.navigate('BookDetails', { book });
  
    try {
      // Rechercher le livre dont l'attribut 'id' correspond à book.id
      const bookSnapshot = await firestore().collection('livres').where('id', '==', book.id).get();
  
      if (!bookSnapshot.empty) {
        const bookRef = bookSnapshot.docs[0].ref;
  
        // Ajouter 1 à "nbr_vues" dans Firestore sans attendre la navigation
        await bookRef.update({
          nbr_vues: firestore.FieldValue.increment(1)
        });
      } else {
        console.error('Aucun livre trouvé avec cet ID :', book.id);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de nbr_vues :', error);
    }
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.bookContainer}
      onPress={() => handlePress(item)}
    >
      <FastImage
        source={{
          uri: item.coverUrl,
          priority: FastImage.priority.high,
        }}
        style={styles.bookCover}
        resizeMode={FastImage.resizeMode.cover}
        onLoad={() => setIsImageLoaded(true)} 
        defaultSource={require('../assets/images/patientez.png')}
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (genre) => {
    const genreBooks = books.filter(book => book.genre === genre);

    return (
      <View style={styles.body} key={genre}>
        <TouchableOpacity onPress={() => navigation.navigate('CategoryDetails', { category: genre })} style={{ justifyContent:'center',padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.titles]}>{genre}</Text>
          <View style={{ flex: 1 }}></View>
          <View style={{flexDirection:'row',justifyContent:'center',paddingTop:15}}>
            <Text style={{color:'#0cc0df',textDecorationLine:'underline'}}>plus</Text>
            <Feather name='chevron-right' size={22} color={'black'} />
          </View>
        </TouchableOpacity>

        <FlatList
          data={genreBooks.slice(0, 6)} // Limite l'affichage à 12 éléments
          keyExtractor={item => item.id}
          renderItem={renderBook}
          contentContainerStyle={styles.mesLivres}
          showsHorizontalScrollIndicator={false}
          numColumns={3}
        />
      </View>
    );
  };

  if (loading) { 
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
    </View>
    );
  }

  const genres = [...new Set(books.map(book => book.genre))]; // Extract unique genres

  return (
      <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        } 
        >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Accueil</Text>
            <Text style={{ width: 70, borderColor: "#0cc0df", borderTopWidth: 4, height: 0, borderRadius: 50 }}></Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('item')}>
            <Feather name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View>
          <FlatList
            data={carousselAuto ? booksCaroussel : books}
            ref={flatListRef}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ flex: 1, width: width }}
                onPress={() => handlePress(item)}
              >
              <FastImage
                source={{ uri: item.coverUrl, priority: FastImage.priority.high }}
                style={styles.carousel}
                resizeMode={FastImage.resizeMode.contain}
                defaultSource={require('../assets/images/patientez.png')}
              />       
              </TouchableOpacity>
            )}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          /> 
        </View>
        {genres.map(genre => renderCategory(genre))}
        {/* <Modal isVisible={isRatingModalVisible} onBackdropPress={() => setRatingModalVisible(false)}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, justifyContent:'center',alignItems:'center' }}>
            <Text>Chaque couverture peut prendre un peu de temps à charger, merci de votre patience 😊</Text>
          </View>
          <TouchableOpacity style={[styles.button, { marginTop: 6 }]} onPress={() => setRatingModalVisible(false)} activeOpacity={1}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Modal> */}

         {/* Nouvelle modale pour devenir auteur */}
         <Modal isVisible={isRatingModalVisible} onBackdropPress={() => setRatingModalVisible(false)}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color:'black',fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Voulez-vous devenir auteur ?</Text>
            <Text style={{ color:'black',marginBottom: 20 }}>Partagez vos écrits avec le monde et laissez une trace indélébile.</Text>
            <Image source={require('../assets/images/author_image.jpg')} style={{ width: 150, height: 150, marginBottom: 20 }} />
            <Text style={{color:'black'}}>Rejoignez notre communauté d'auteurs passionnés.</Text>
          </View>
          <View style={{width:'100%',flexDirection:'row',justifyContent:'space-between',padding:8}}>
            <TouchableOpacity style={styles.button} onPress={openAuthorPage} activeOpacity={1}>
              <Text style={styles.buttonText}>Oui, je veux devenir auteur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setRatingModalVisible(false)} activeOpacity={1}>
              <Text style={styles.buttonText}>Non, merci</Text>
            </TouchableOpacity>
          </View>
          
        </Modal>

      </ScrollView>
    </View>
    

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    marginTop:40
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
  },
  carousel: {
    width: width,
    height: 400,
  },
  titles: {
    fontSize: 25,
    fontWeight: 'regular',
    color: 'black',
    marginTop: 15,
    width:"80%",
  },
  body: {
    marginBottom: 20,
  },
  mesLivres: {
    marginBottom: 10,
    justifyContent:'center',
    marginHorizontal:1
  },
  bookContainer: {
    marginHorizontal: 4,
    width: 115,
    marginBottom: 16,
    flex:1/3
  },
  bookCover: {
    width: 115,
    height: 170,
    borderRadius: 2,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'regular',
    color: '#000000',
    width: '100%'
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tab1: {
    alignItems: 'center',
    flex: 1 / 3,
  },
  tab2: {
    alignItems: 'center',
    flex: 1 / 3,
  },
  tab3: {
    alignItems: 'center',
    flex: 1 / 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#12c066',
    padding: 10,
    borderRadius: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight:'bold',
    textAlign:'center',
  },
});