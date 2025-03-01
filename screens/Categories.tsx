import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, FlatList, ActivityIndicator, Dimensions, Alert, LogBox } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import RNFetchBlob from 'react-native-blob-util';
import { useAppContext } from '../AppContext';
import SearchBar from './SearchBar';
import commonStyles from './stylesCommon';
//import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';

LogBox.ignoreAllLogs();

const { width, height } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { sharedState } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [categoriesBook, setCategoriesBook] = useState([]);
  const [books, setBooks] = useState([]);
  const [freeBooks, setFreeBooks] = useState([]);
  const [bestBooks, setBestBooks] = useState([]);
  const [mostRead, setMostRead] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigation = useNavigation();
  const [loadingCovers, setLoadingCovers] = useState(true);

  useEffect(() => {
    const fetchBooks = () => {
      try {
        // Utiliser onSnapshot pour écouter les changements en temps réel
        const unsubscribe = firestore()
          .collection('livres')
          .where('verdict', '==', 'accepted') // Filtre sur le verdict "accepted"
          .orderBy('dateAdded', 'desc') // Trier par date décroissante
          .limit(10) // Limiter à 10 livres
          .onSnapshot(snapshot => {
            if (snapshot.empty) {
              console.warn('Aucun livre trouvé avec le verdict "accepted".'); // Log si aucun livre trouvé
              setBooks([]); // Mettre à jour l'état avec un tableau vide
            } else {
              const booksList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setBooks(booksList);
            }
            });
    
        // Retourner la fonction de désabonnement pour arrêter d'écouter les changements si nécessaire
        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur lors de la récupération des livres:', error); // Log de l'erreur
      }
    };
    
    
    
    const fetchFreeBooks = () => {
      try {
        // Utiliser onSnapshot pour écouter les changements en temps réel
        const unsubscribe = firestore()
          .collection('livres')
          .where('verdict', '==', 'accepted') // Filtre sur le verdict "accepted"
          .where('price', '==', 0)
          .orderBy('dateAdded', 'desc') // Trier par date décroissante
          .onSnapshot(snapshot => {
            if (snapshot) { // Vérifie que snapshot n'est pas null
              if (snapshot.empty) {
                console.warn('Aucun livre trouvé avec le verdict "accepted".'); // Log si aucun livre trouvé
                setFreeBooks([]); // Mettre à jour l'état avec un tableau vide
              } else {
                const booksList = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setFreeBooks(booksList);
              }
            } else {
              console.warn('Snapshot est nul.'); // Log pour snapshot nul
            }
          }, error => {
            console.error('Erreur lors de la récupération des livres:', error); // Log de l'erreur
          });
    
        // Retourner la fonction de désabonnement pour arrêter d'écouter les changements si nécessaire
        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur lors de la récupération des livres:', error); // Log de l'erreur
      }
    };
    
    
 

    const fetchCategoriesBook = async () => {
      try {
        // Vérifier s'il existe des catégories stockées en local
        const localCategories = await AsyncStorage.getItem('categoriesList');
        
        if (localCategories) {
          // Si des catégories sont disponibles en local, les utiliser
          setCategoriesBook(JSON.parse(localCategories));
        } else {
          // Sinon, récupérer les catégories depuis Firebase
          const categoriesCollection = await firestore()
            .collection('catégories')
            .get();
          
          const categoriesList = categoriesCollection.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Stocker les catégories récupérées en local
          await AsyncStorage.setItem('categoriesList', JSON.stringify(categoriesList));
          
          // Mettre à jour l'état avec les catégories récupérées
          setCategoriesBook(categoriesList);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false); // Indique que le chargement est terminé
      }
    };

    const fetchTopViewedBooks = async () => {
      try {
        const snapshot = await firestore()
          .collection('livres')
          .where('verdict', '==', 'accepted') // Filtre sur le verdict "accepted"
          .orderBy('nbr_vues', 'desc')
          .limit(3)
          .get(); // Utilisez get() pour une récupération unique
    
        // Vérifier si le snapshot contient des documents
        if (!snapshot.empty) {
          const booksList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          // Stocker les livres récupérés en local
          await AsyncStorage.setItem('topViewedBooks', JSON.stringify(booksList));
    
          // Mettre à jour l'état avec les livres récupérés
          setBestBooks(booksList);
        } else {
          console.warn('No books found with the accepted verdict.');
          // Optionnel : Mettre à jour l'état avec un tableau vide ou une valeur par défaut
          setBestBooks([]);
        }
      } catch (error) {
        console.error('Error fetching top viewed books:', error);
      }finally{
        setLoadingCovers(false);
      }
    };
    
    
    

    const fetchTopRatedBooks = async () => {
      try {
        // Vérifier s'il existe des livres les mieux notés stockés en local
        const localTopRatedBooks = await AsyncStorage.getItem('topRatedBooks');
    
        if (localTopRatedBooks) {
          // Si les livres les mieux notés sont disponibles en local, les utiliser
          setMostRead(JSON.parse(localTopRatedBooks));
        }
    
        // Utiliser onSnapshot pour écouter les changements en temps réel
        firestore()
          .collection('livres')
          .where('verdict', '==', 'accepted') // Filtre sur le verdict "accepted"
          .onSnapshot(async (snapshot) => {
            const booksList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              note: parseFloat(doc.data().note), // Convertir le champ 'note' en nombre
            }));
    
            // Trier les livres par note en ordre décroissant
            const sortedBooks = booksList.sort((a, b) => b.note - a.note);
    
            // Prendre les 3 livres avec les meilleures notes
            const topRatedBooks = sortedBooks.slice(0, 3);
    
            // Stocker les livres récupérés en local
            await AsyncStorage.setItem('topRatedBooks', JSON.stringify(topRatedBooks));
    
            // Mettre à jour l'état avec les livres les mieux notés
            setMostRead(topRatedBooks);
          });
      } catch (error) {
        console.error('Error fetching top rated books:', error);
      }
    };
    
    

    const fetchCategories = async () => {
      try {
        // Vérifier s'il existe des catégories stockées en local
        const localCategories = await AsyncStorage.getItem('categories');
    
        if (localCategories) {
          // Si les catégories sont disponibles en local, les utiliser
          setCategories(JSON.parse(localCategories));
        } else {
          // Sinon, récupérer les catégories depuis Firebase
          const categoriesCollection = await firestore().collection('decouverte').get();
          const categoriesList = categoriesCollection.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          // Stocker les catégories récupérées en local
          await AsyncStorage.setItem('categories', JSON.stringify(categoriesList));
    
          // Mettre à jour l'état avec les catégories récupérées
          setCategories(categoriesList);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCollections = async () => {
      try {
        // Vérifier s'il existe des collections stockées en local
        const localCollections = await AsyncStorage.getItem('collections');
          // Sinon, récupérer les collections depuis Firebase
          const collectionsSnapshot = await firestore()
            .collection('collections')
            .limit(10)
            .get();
          const collectionsList = collectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          // Stocker les collections récupérées en local
          await AsyncStorage.setItem('collections', JSON.stringify(collectionsList));
    
          // Mettre à jour l'état avec les collections récupérées
          setCollections(collectionsList);
        
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFreeBooks();
    fetchCategoriesBook();
    fetchTopRatedBooks();
    fetchCollections();
    fetchBooks();
    fetchCategories();
    fetchTopViewedBooks();
  }, []);

  const downloadPDF = async (url, fileName) => {
    const { dirs } = RNFetchBlob.fs;
    const path = `${dirs.DocumentDir}/${fileName}`;

    try {
      const res = await RNFetchBlob.config({
        path: path,
      }).fetch('GET', url);

      console.log('PDF downloaded to:', res.path());
      return res.path();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      return null;
    }
  };

  const handlePress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  const handleReadPress = async () => {
    setLoading(true);
    const localPath = await downloadPDF(selectedBook.pdfUrl, `${selectedBook.name}.pdf`);
    setLoading(false);

    if (localPath) {
      navigation.navigate('pdfviewer', { pdfUrl: localPath });
    } else {
      console.error('Failed to download PDF.');
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryDetails', { category: category.nom });
  };


  const isBookInFavorites = async (bookName, userUid) => {
    const userRef = firestore().collection('users').doc(userUid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    return userData && userData.favories && userData.favories.includes(bookName);
  };

  const handleAddToFavorites = async () => {
    const user = sharedState.user;
    if (!user || !user.uid) {
      Alert.alert('Please log in to add to favorites.');
      return;
    }

    try {
      const bookInFavorites = await isBookInFavorites(selectedBook.name, user.uid);

      if (bookInFavorites) {
        Alert.alert('Déjà en favories');
        return;
      }

      const userRef = firestore().collection('users').doc(user.uid);
      userRef.update({
        favories: firestore.FieldValue.arrayUnion(selectedBook.name),
      });
      Alert.alert('Book added to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.bookContainer}
      onPress={() => handlePress(item)}
    >
      
        <FastImage 
          source={{ uri: item.coverUrl }} 
          style={styles.bookCover} 
          resizeMode={FastImage.resizeMode.cover}
          defaultSource={require('../assets/images/patientez.png')}
        />      
      <View style={{marginLeft:10}}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  

  const renderCover = ({ item }) => (
    <TouchableOpacity style={styles.collectionContainer} onPress={()=>navigation.navigate('CollectionDetails', {
      nom: item.nom,
      livres: item.livres,
    })}>
        <FastImage 
          source={{ uri: item.cover_img }} 
          style={styles.collectionCover}
          defaultSource={require('../assets/images/patientez.png')}
        />
      <Text style={{fontSize:18,color:'black'}}>{item.nom}</Text>
      
    </TouchableOpacity>
  );

  // ...

const renderCategory = ({ item }) => (
  <TouchableOpacity
    style={styles.categoryContainer}
    onPress={() => navigation.navigate('CategoryDetails', { category: item.nom })}
  >
    <Text style={styles.categoryText}>{item.nom}</Text>
  </TouchableOpacity>
);

// Dans le return de DiscoverScreen, ajoutez ce bloc où vous voulez afficher les catégories
<View style={{ padding: 10 }}>
  <FlatList
    data={categoriesBook}
    keyExtractor={(item) => item.id}
    renderItem={renderCategory}
    contentContainerStyle={styles.categoryListContainer}
    horizontal
    showsHorizontalScrollIndicator={false}
    numColumns={2}  // Pour afficher les catégories en deux lignes
  />
</View>



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Découverte</Text>
          <Text style={{width:70,borderColor:"#0cc0df",borderTopWidth:4,height:0,borderRadius:50}}></Text>
        </View> 
      </View>
      <View style={{justifyContent:'center', alignItems:'center',marginVertical:20}}>
        <SearchBar books={books} onBookPress={handlePress} />
      </View>
      <View style={{ padding: 10, flexDirection: 'column' }}>
          <Text style={styles.titles}>Nouveautes</Text>
        </View>
        <View>
          <FlatList
            data={books}
            keyExtractor={item => item.id}
            renderItem={renderBook}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
          />
        </View>

        <View style={{ padding: 10, flexDirection: 'column' }}>
          <Text style={styles.titles}>Gratuit</Text>
        </View>
        <View>
          <FlatList
            data={freeBooks}
            keyExtractor={item => item.id}
            renderItem={renderBook}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
          />
        </View>
      
      <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.titles}>Collections</Text>
        </View>
        <View>
          <FlatList
            data={collections}
            keyExtractor={item => item.id}
            renderItem={renderCover}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
          />
        </View>

        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.titles}>Les Plus Populaire</Text>
        </View>
        <View>
          <FlatList
            data={bestBooks}
            keyExtractor={item => item.id}
            renderItem={renderBook}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
          />
        </View>

        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.titles}>Les Mieux Noté</Text>
        </View>
        <View>
          <FlatList
            data={mostRead}
            keyExtractor={item => item.id}
            renderItem={renderBook}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
          />
        </View>

        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.titles}>Nos Categories</Text>
        </View>
        <View>
        <FlatList
          data={categoriesBook}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoryListContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
        />
        </View>
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
    marginTop: 40
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  bookContainer: {
    marginHorizontal: 10,
    //height:'100%'
  },
  bookCover: {
    width: 160,
    height: 250,
    borderRadius: 5,
  },
  bookTitle: {
    fontSize: 14,
    color: '#000',
    maxWidth:150
  },
  titles: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  mesLivres: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  tab1: {
    flex:1/3,
    alignItems: 'center',
  },
  tab2: {
    flex:1/3,
    alignItems: 'center',
  },
  tab3: {
    flex:1/3,
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
    //height:'100%'
  },
  collectionContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  collectionCover: {
    width: 300,
    height: 250,
    borderRadius: 8,
    marginBottom: 10,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  categoryListContainer: {
    paddingHorizontal: 10,
    flexWrap: 'wrap',
    width:3000
  },
  skeletonBookCover: {
    width: 160,
    height: 250,
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Couleur grise pour imiter le chargement
  },
  skeletonCollectionCover: {
    width: 300,
    height: 250,
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Couleur grise pour imiter le chargement
  },
});
