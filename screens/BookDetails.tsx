import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, TextInput, KeyboardAvoidingView, Platform, Linking, RefreshControl, StatusBar, LogBox } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RNFetchBlob from 'react-native-blob-util';
import { useAppContext } from '../AppContext';
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';
//import StarRating from 'react-native-star-rating';
import Share from 'react-native-share';
import Toast from 'react-native-root-toast';
//import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import * as Progress from 'react-native-progress';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';


LogBox.ignoreAllLogs();


const BookDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullDescriptionAuteur, setShowFullDescriptionAuteur] = useState(false);
  const { sharedState } = useAppContext();
  const [mostRead, setMostRead] = useState([]);
  const [books, setBooks] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [maxRating, setMaxRating] = useState([1,2,3,4,5]);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalVisibleEp, setModalVisibleEp] = useState(false);
  const [user, setUser] = useState(null);
  const [reviewCount, setReviewCount] = useState(book.revues.length);
  const [hasVoted, setHasVoted] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [userAvis, setUserAvis] = useState('exprimez vous...');
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [authorInfo, setAuthorInfo] = useState({
    photo: '',
    metier: '',
    bio: '',
    name:''
  });
  const [photo, setPhoto] = useState('');
  const [metier, setMetier] = useState('');
  const [bio, setBio] = useState('');
  const [canRead, setCanRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [isLoading, setIsLoading] = useState(false);


  const fetchBookData = async () => {
    try {
      const bookDoc = await firestore().collection('livres').doc(currentBook.id).get();
      if (bookDoc.exists) {
        setCurrentBook(bookDoc.data());  // Met à jour l'état avec les nouvelles données
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données : ", error);
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


  const CustomRatingBar = ({ book, closeModal }) => {
    const [defaultRating, setDefaultRating] = useState(userRating !== null ? userRating : 1);
    const maxRating = [1, 2, 3, 4, 5];
    const [avis, setAvis] = useState('');
  
    const starImgFilled = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_filled.png';
    const starImgCorner = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_corner.png';
  
    const handleRatingSubmit = async () => {
      closeModal();
    
      try {
        const bookRef = firestore().collection('livres').doc(book.id);
        const bookDoc = await bookRef.get();
        const bookData = bookDoc.data();
    
        // Vérification si l'utilisateur a déjà noté ce livre
        const userAlreadyReviewed = bookData.revues.find((review) => review.user_name === user.uname);
    
        if (userAlreadyReviewed) {
          // Mettre à jour l'avis existant de l'utilisateur
          const updatedRevues = bookData.revues.map((review) => {
            if (review.user_name === user.uname) {
              return {
                ...review,
                note: defaultRating,
                avis: avis,
                date: new Date().toISOString(),
              };
            }
            return review;
          });
    
          await bookRef.update({
            revues: updatedRevues,
          });
    
          Toast.show('Votre note a été mise à jour.');
        } else {
          // Ajouter une nouvelle revue
          await bookRef.update({
            revues: firestore.FieldValue.arrayUnion({
              user_img: user.image,
              user_name: user.uname,
              note: defaultRating,
              avis: avis,
              date: new Date().toISOString(),
            }),
          });
    
          Toast.show('Merci pour votre note !');
        }
      } catch (error) {
        console.error('Error updating book rating:', error);
        Toast.show('Erreur lors de la soumission de la note.');
      }
    };
  
    return (

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'black', textAlign: 'center' }}>Notez: {book.name}</Text>
        <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 16 }}>
          {maxRating.map((item, key) => (
            <TouchableOpacity
              activeOpacity={0.7}
              key={item}
              onPress={() => setDefaultRating(item)}
              
            >
              <Image
                style={{ width: 40, height: 40, resizeMode: 'cover' }}
                source={(item <= defaultRating) 
                        ? { uri: starImgFilled } 
                        : { uri: starImgCorner }}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{width:'100%',marginTop:16}}>
          <TextInput
              style={styles.textarea}
              multiline={true}
              numberOfLines={10}
              onChangeText={setAvis}
              value={avis}
              placeholder={userAvis}
              placeholderTextColor="#888"
              textAlignVertical="top"
            />
        </View>
        <TouchableOpacity style={[styles.button, { marginTop: 6 }]} onPress={handleRatingSubmit} activeOpacity={1}>
        <Text style={styles.buttonText}>
          {userRating ? 'Renoter' : 'Noter'}
        </Text>
        </TouchableOpacity>
      </View>

    );
  };
  
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const user = sharedState.user; 
      if (user && user.uid) {
        const isInFavorites = await isBookInFavorites(book.id, user.uid);
        setIsFavorite(isInFavorites);
      }
    };
  
    const fetchAuthorInfo = async () => {
      try {
        const authorSnapshot = await firestore()
          .collection('auteurs')
          .where('id', '==', book.hauteur)
          .get();
  
        if (!authorSnapshot.empty) {
          const authorData = authorSnapshot.docs[0].data();
          setAuthorInfo({
            photo: authorData.photo,
            metier: authorData.Metier,
            bio: authorData.bio,
            name: authorData.NomPrenom
          });
        }
      } catch (error) {
        console.error('Error fetching author info:', error);
      }
    };
  
    const checkIfBookIsPurchased = async () => {
      try {
        let bookId = book.id;
        bookId = bookId.replace(/ /g, '_');  // ID du livre
        console.log(bookId);
        const storageKey = `canRead_${bookId}`;  // Clé unique pour chaque livre
    
        // Vérifier dans AsyncStorage si la clé existe (indiquant que l'état a déjà été vérifié une fois)
        const storedCanRead = await AsyncStorage.getItem(storageKey);
    
        // Si la clé n'existe pas encore, on procède à la vérification en ligne
        if (storedCanRead === null) {
          const user = sharedState.user;
          if (user && user.uid) {
            // Utiliser onSnapshot pour écouter les changements en temps réel
            firestore()
              .collection('users')
              .doc(user.uid)
              .onSnapshot(async (userSnapshot) => {
                if (userSnapshot.exists) {
                  const userData = userSnapshot.data();
                  if (userData.buyed && userData.buyed.includes(bookId)) {
                    // Si le livre est acheté, on stocke cette info localement
                    await AsyncStorage.setItem(storageKey, JSON.stringify(true));
                    console.log("Le livre est detenu par ",user.uid)
                    setCanRead(true);  // Met à jour la variable canRead
                  } else {
                    setCanRead(false);
                  }
                } else {
                  // Si l'utilisateur n'existe pas
                  await AsyncStorage.setItem(storageKey, JSON.stringify(false));
                  setCanRead(false);
                }
              });
          } else {
            // Si l'utilisateur n'est pas connecté
            await AsyncStorage.setItem(storageKey, JSON.stringify(false));
            setCanRead(false);
          }
        } else {
          // Si la clé existe déjà dans AsyncStorage, on utilise cette valeur
          const canRead = JSON.parse(storedCanRead);
          setCanRead(canRead);  // Met à jour la variable canRead localement
        }
      } catch (error) {
        console.error('Error checking if book is purchased:', error);
      }
    };
    
    
    
  
    fetchAuthorInfo();
    checkFavoriteStatus();
    checkIfBookIsPurchased();  // Appelle la fonction pour vérifier si le livre est acheté
  }, [book.name, sharedState.user]);
  

  useEffect(() => {
    const user = sharedState.user;
    const unsubscribe = firestore()
      .collection('livres')
      .where('name', '==', book.name)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const userReview = data.revues.find((review) => review.user_name === user.uname);
          if (userReview) {
            setUserRating(userReview.note);
            setUserAvis(userReview.avis)
          } else {
            setUserRating(null);
          }
        });
      });
    return () => unsubscribe();

  
    //checkUserRating();
  }, []);


  const handleReadMore = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleReadMoreAuteur = () => {
    setShowFullDescriptionAuteur(!showFullDescriptionAuteur);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    
    fetchUser();
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
  
  const handleHearPress = async () => {
    setLoading(true);
  
    // Vérification dans AsyncStorage si le fichier a déjà été téléchargé
    const storedPath = await AsyncStorage.getItem(`${book.id}_pdfPath`);
  
    let localPath;
    
    if (storedPath) {
      // Si le fichier est trouvé en local
      localPath = storedPath;
      console.log('PDF already available locally:', localPath);
    } else {
      // Si le fichier n'est pas trouvé, on le télécharge
      localPath = await downloadPDF(book.pdfUrl, `${book.name}.pdf`);
      
      // Si le téléchargement a réussi, on enregistre le chemin dans AsyncStorage
      if (localPath) {
        await AsyncStorage.setItem(`${book.id}_pdfPath`, localPath);
      }
    }
  
    setLoading(false);

    if (localPath) {
      setModalVisible(false);
      navigation.navigate('pdfvoice', { pdfUrl: localPath, book });
    } else {
      console.error('Failed to download or retrieve PDF.');
      Toast.show('livre indisponible');
      navigation.navigate('BookDetails');
    }

  }
  
  const handlePress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  const isBookInFavorites = async (bookId, userUid) => {
    const userRef = firestore().collection('users').doc(userUid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    return userData?.favorites?.includes(bookId) || false;
    
  };
  

  useEffect(() => {
    // Rechercher le livre par son nom et écouter les mises à jour en temps réel
    const unsubscribe = firestore()
      .collection('livres')
      .where('name', '==', book.name)
      .onSnapshot((querySnapshot) => {
        if (!querySnapshot.empty) {
          const bookDoc = querySnapshot.docs[0];
          const bookData = bookDoc.data();
          setReviews(bookData.revues || []); // Mettez à jour les revues en temps réel
          setEpisodes(bookData.episodes || []);
        }
      });

    return () => unsubscribe(); // Clean up pour éviter les fuites de mémoire
}, [book.name]);

  useEffect(() => {

    const fetchTopRatedBooks = async () => {
      try {
        const booksCollection = await firestore()
          .collection('livres')
          .where('verdict','==','accepted')
          .get();
          
        const booksList = booksCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          note: parseFloat(doc.data().note), // Convertir le champ 'note' en nombre
        }));
    
        // Trier les livres par note en ordre décroissant
        const sortedBooks = booksList.sort((a, b) => b.note - a.note);
    
        // Prendre les 3 livres avec les meilleures notes
        const topRatedBooks = sortedBooks.slice(0, 3);
    
        setMostRead(topRatedBooks);
      } catch (error) {
        console.error('Error fetching top rated books:', error);
      }
    };
    
    fetchTopRatedBooks();
  }, []);

  const handleAddToFavorites = async () => {
    const user = sharedState.user;
    if (!user?.uid) return;

    // Déterminez l'état cible en fonction de l'état actuel
    const newFavoriteState = !isFavorite;

    // Mettez à jour l'état visuel instantanément
    setIsFavorite(newFavoriteState);

    // Affichez le toast correspondant
    Toast.show(newFavoriteState ? 'livre ajouté' : 'livre retiré');

    try {
        const bookInFavorites = await isBookInFavorites(book.id, user.uid);
        const userRef = firestore().collection('users').doc(user.uid);

        if (newFavoriteState) {
            if (!bookInFavorites) {
                await userRef.update({
                    favorites: firestore.FieldValue.arrayUnion(book.id),
                });
            }
        } else {
            if (bookInFavorites) {
                await userRef.update({
                    favorites: firestore.FieldValue.arrayRemove(book.id),
                });
            }
        }
    } catch (error) {
        // Si la requête échoue, remettez l'état à son état précédent
        setIsFavorite(!newFavoriteState);
        console.error('Error updating favorites:', error);
        Toast.show('not added');
    }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.bookContainer}
      onPress={() => handlePress(item)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
      <View style={{width:80}}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const openPDF = (url) => {
    Linking.openURL(url);
  };
  const renderEpisode = ({ item, index }) => (
    <TouchableOpacity 
      key={index} 
      onPress={async () => {
        if (canRead) {
          
        let  localPath = await downloadPDF(book.pdfUrl, `${item.name}.pdf`);
        await AsyncStorage.setItem(`${item.name}_pdfPath`, localPath);

          navigation.navigate('pdfviewer', { pdfUrl: localPath });
        } else {
          Toast.show('Veuillez acheter le livre pour lire cet épisode', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
      }}
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', height: 80, flexDirection: 'row', alignItems: 'center' }}
    >
      <Text style={{ color: 'black' }}>#{index + 1}</Text>
      <Image source={item.image ? { uri: item.image } : require('../assets/images/auteur.png')} style={{ width: 38, height: 48, borderColor: 'lightgray', borderWidth: 0.7, marginLeft: 8 }} />
      <View style={{ paddingLeft: 8 }}>
        <Text style={{ color: 'black', fontWeight: 'bold', width: 150 }}>{item.titre}</Text>
        <Text style={{ color: 'black', width: 150 }} numberOfLines={1}>{item.description}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'gray', textAlign: 'right', marginTop: 38, fontSize: 10 }}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>

  );


  const renderReview = ({ item }) => {
    const stars = Array.from({ length: 5 }, (_, index) => index + 1);

    return (
      <View style={styles.reviewContainer}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Image source={{ uri: item.user_img }} style={styles.userImage} />
          <Text style={styles.userName}>{item.user_name}</Text>
        </View>
        <View>
          <View style={styles.ratingContainer}>
              {stars.map(star => (
                <FontAwesome
                  key={star}
                  name={star <= item.note ? 'star' : 'star-o'}
                  size={16}
                  color={star <= item.note ? 'orange' : '#ddd'}
                />
              ))}
              <Text style={{color:'orange',marginLeft:8,fontWeight:'bold'}}>Achat confirme</Text>
            </View>
        </View>
        <View style={styles.reviewContent}>
          <Text style={{color:'lightgray'}}>revus le {formatDate(item.date)}</Text>
          <Text style={styles.reviewText}>{item.avis}</Text>
        </View>
      </View>
    );
  };
 


  // const handleRating = async (newRating) => {
  //   setRating(newRating);

  //   try {
  //     await firestore().collection('books').doc(book.id).update({ rating: newRating });
  //   } catch (error) {
  //     console.error('Error updating rating:', error);
  //   }
  // };

  const sortedReviews = reviews
    ? [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

    const handleShare = async () => {
      // Ajoutez les paramètres nécessaires au lien
      const deepLinkUrl = `https://seedsoftengine.page.link/ZCg5/?screen=BookDetails&bookId=${book.id}`;
    
      // Options pour le partage
      const shareOptions = {
        title: book.name,
        message: `Découvrez ce livre : ${book.name} par ${book.hauteur}. Cliquez sur ce lien pour voir les détails dans l'application :`,
        url: deepLinkUrl,
        failOnCancel: false,
      };
    
      try {
        await Share.open(shareOptions);
      } catch (error) {
        console.error('Erreur lors du partage des détails du livre :', error);
      }
    };
    

  const calculateAverageNote = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
  
    const total = reviews.reduce((sum, review) => sum + review.note, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:200, height:200, marginBottom:32,borderRadius:100}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
    </View>
      </View>
    );
  }

  const averageNote = calculateAverageNote(reviews);

  const addSaleWithTimeout = async (venteData, userRef, bookId) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000) // 5 secondes de délai
    );
  
    const firestorePromise = firestore().collection('ventes_direct').add(venteData);
  
    try {
      await Promise.race([firestorePromise, timeoutPromise]);
      await userRef.update({
        buyed: firestore.FieldValue.arrayUnion(bookId)
      });
      return true; // Succès
    } catch (error) {
      throw new Error(error.message); // Gérer l'erreur
    }
  };

  const BuyBook = async (navigation, book, setIsLoading) => {
    setIsLoading(true); // Démarre le loader
    let timeoutReached = false;
  
    // Définir un timeout de 15 secondes
    const timeout = setTimeout(() => {
      timeoutReached = true;
      setIsLoading(false);
      Alert.alert('Erreur', 'Problème de connexion');
    }, 15000);
  
    try {
      let bookId = book.id.replace(/ /g, '_');
      console.log(bookId);
  
      const ventesRef = firestore().collection('ventes_direct');
      const existingVenteQuery = await ventesRef.where('id', '==', bookId + sharedState.user.uid).get();
  
      if (book.price == 0) {
        const authorId = book.hauteur;
        const bookPrice = book.price;
  
        const venteData = {
          user: sharedState.user.uid,
          auteur: authorId,
          date: new Date(),
          livre: bookId,
          moyen: "OM",
          prix: bookPrice,
          etat: "reussi",
        };
  
        const userRef = firestore().collection('users').doc(sharedState.user.uid);
  
        try {
          await addSaleWithTimeout(venteData, userRef, bookId);
          clearTimeout(timeout); // Annule le timeout
          setIsLoading(false);
          console.log("Nouvelle vente ajoutée avec succès !");
          navigation.navigate('BookDetails', { book });
          return;
        } catch (error) {
          clearTimeout(timeout);
          setIsLoading(false);
          Toast.show('Problème de connexion');
        }
      }
  

        const venteData = {
          user: sharedState.user.uid,
          auteur: book.hauteur,
          date: new Date(),
          livre: book.id,
          moyen: "_",
          prix: book.price,
          id: bookId + sharedState.user.uid,
          etat: "en cours",
        };
  
        await firestore().collection('ventes_direct').add(venteData);
        console.log("Nouvelle vente ajoutée avec succès !");
  
        const formData = new FormData();
        formData.append('email', 'papers@seeds.cm');
        formData.append('token_app', '4fda55961a3152c09d67ede0d8ae2be9');
        formData.append('montant', book.price);
        formData.append('image_link', book.coverUrl);
        formData.append('description', "Vous êtes sur le point d'acheter un livre papers qui sera disponible dans votre application. Validez votre paiement pour finaliser l'achat.");
        formData.append('pass', 'My$S3cr3t$Pap3rs');
        formData.append('success_lien', 'https://silly-babka-5c39a4.netlify.app/pages/succes.html');
        formData.append('echec_lien', 'https://silly-babka-5c39a4.netlify.app/pages/echec.html');
        formData.append('code_produit', bookId);
        formData.append('nom_produit', book.name);
  
        const response = await fetch('https://www.flash.seeds.cm/flash/Service/set_payment_link', {
          method: 'POST',
          body: formData,
        });
  
        const contentType = response.headers.get('content-type');
  
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const { lien_paiement } = data.body;
          const lien_paiement_base64 = btoa(lien_paiement);
  
          clearTimeout(timeout);
          setIsLoading(false);
  
          navigation.navigate('PaymentWebView', { paymentUrl: `https://flashsdk.seeds.cm/flash_checkout.html?d=${lien_paiement_base64}`, book });
        } else {
          const htmlContent = await response.text();
          clearTimeout(timeout);
          setIsLoading(false);
  
          navigation.navigate('PaymentWebView', { htmlContent });
        }
      
    } catch (error) {
      console.error('Erreur lors de la création du lien de paiement :', error);
      if (!timeoutReached) {
        clearTimeout(timeout);
        setIsLoading(false);
        Alert.alert('Erreur', 'Problème de connexion');
      }
    }
  };
  
  const handleSubscriptionOrBuy = (navigation, book, setIsLoading) => {
    BuyBook(navigation, book, setIsLoading);
  };

  const DynamicFlatList = ({ data, renderItem }) => {
  return (
    <View style={{ backgroundColor: '#fff', padding: 16, borderBottomColor: '#f9f9f9', borderBottomWidth: 8 }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

  return (
    <ScrollView 
      style={{flex:1,height:'100%'}} 
      keyboardShouldPersistTaps="always"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      } 
      >
      <StatusBar backgroundColor="#0cc0df" barStyle="dark-content" />
      <View style={[{flex:0.8,backgroundColor:'#0cc0df',padding:16,flexDirection:'row',justifyContent:'space-between'}]}>
        <View style={{flexDirection:'row'}}>
          <FastImage
              style={styles.coverImage}
              source={{
                uri: book.coverUrl,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
              defaultSource={require('../assets/images/patientez.png')}
            />         
            <View style={{justifyContent:'center'}}>
             <Text style={{color:'#096d98',fontWeight:'bold',width:140,fontSize:11}} numberOfLines={1}>{book.genre}</Text>
             <Text style={styles.title} numberOfLines={2}>{book.name}</Text>
             <Text style={{width:150,fontWeight:'regular',color:'white',fontSize:14}} numberOfLines={3}>{book.small_summary}</Text>
             <View style={{flexDirection:'row',marginVertical:16,alignItems:'center'}}>
               <FontAwesome name="star" size={8} color="yellow" />
               <Text style={{marginLeft:4,fontSize:8}}>{averageNote}</Text>
               <Feather name="users" size={8} color="white" style={{marginLeft:8}}/>
             <Text style={{marginLeft:4,fontSize:8}}>{book.nbr_vues}</Text>
             {canRead && (
             <TouchableOpacity
                style={{marginLeft:8, backgroundColor:'white',padding:2, borderRadius:50,width:80}}
                onPress={() => setRatingModalVisible(true)}
              >
                
                  <Text style={{color:'black',textAlign:'center',fontSize:11}}>
                  {userRating ? `votre note (${userRating})` : 'evaluer'}
                </Text>
              </TouchableOpacity>
              )}
             </View>
             <Text style={{width:140,fontWeight:'bold',color:'white',marginTop:5}} numberOfLines={2}>par {authorInfo.name}</Text>
           </View>
        </View>
        <View style={{alignItems:'center',marginTop:-16,}}>
          <TouchableOpacity style={styles.action} onPress={handleShare}>
            <Feather name="share" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
      style={styles.action}
      onPress={() => {
        if (canRead) { // Remplace 'isBookInLibrary' par ta variable d'état booléenne
          let toast = Toast.show('Ce livre est disponible dans la section <<Mes livres>> de votre bibliothèque.', {
            duration: Toast.durations.LONG, // 4 secondes (LONG par défaut est 3500ms, ajusté ici pour 4000ms)
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });

          // Masquer le toast après 4 secondes
          setTimeout(function () {
            Toast.hide(toast);
          }, 4000); // 4000ms = 4s
        } else {
          BuyBook(navigation, book, setIsLoading); // Ta fonction d'achat de livre
        }
      }}
    >
      <Feather name="download" size={18} color="#fff" />
    </TouchableOpacity>
          <TouchableOpacity 
              style={styles.action} 
              onPress={handleAddToFavorites}
          >
              <FontAwesome 
                  name={isFavorite ? 'bookmark' : 'bookmark-o'} 
                  size={18} 
                  color='white'
              />
          </TouchableOpacity>
        </View>
      </View>
  {!canRead && (<View style={[{flex:0.5,backgroundColor:'#fff',padding:16,flexDirection:'row',borderBottomColor:'#f9f9f9',borderBottomWidth:8}]}>
    <View style={{flex:1,justifyContent:'center', alignItems:'center'}}>
      <TouchableOpacity
        style={[styles.radioButton,{marginTop:-8}]}
        onPress={() => setSelectedValue('option1')}
      >
        {/* <View style={[styles.outerCircle, selectedValue === 'option1' && styles.selected]}>
          {selectedValue === 'option1' && <View style={styles.innerCircle} />}
        </View> */}
        <View style={{}}>
          <Text style={styles.radioText}>paiement unique</Text>
          <Text style={{ color: '#12c066', fontSize: 25 }}>
            {book.price === 0 ? book.price+'  (GRATUIT)' : book.price} 
            <Text style={{ fontSize: 14 }}>
              {book.price === 0 ? '' : ' FCFA'}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>

    {/* {book.blue_papers && (<View style={{flex:0.8,}}>
      <TouchableOpacity
        style={styles.radioButton}
        onPress={() => setSelectedValue('option2')}
      >
        <View style={[styles.outerCircle, selectedValue === 'option2' && styles.selected]}>
          {selectedValue === 'option2' && <View style={styles.innerCircle} />}
        </View>
        <View style={{}}>
          <Text style={styles.radioText}>Blue papers✨</Text>
          <Text style={{fontSize:8,width:100,fontWeight:'bold',color:'black'}} numberOfLines={4}>
            Accedez gratuitement a tous les livres pepers blues a partir de 5000frc/mois
          </Text>
        </View>
      </TouchableOpacity>
    </View>)} */}

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0cc0df" />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleSubscriptionOrBuy(navigation, book, setIsLoading)}
        >
          <Text style={styles.buttonText}>OBTENIR</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>)}
  {canRead && (
    <View style={[{flex:0.5, backgroundColor:'#fff', padding:16, flexDirection:'row', borderBottomColor:'#f9f9f9', borderBottomWidth:8,justifyContent: 'center',}]}>
      <TouchableOpacity 
      style={{
        borderWidth: 0.7,
        borderColor: '#c0c0c0',
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 10,
        width: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, // Pour Android
      }} 
      onPress={()=>navigation.navigate('pdfviewer',{ pdfUrl: book.pdfUrl })}
    >
      <Image
        source={require('../assets/images/livre-ouvert.png')}
        style={{ width: 30, height: 30, marginRight: 8 }}
      />
      <Text style={{ fontSize: 14, color: "black", textAlign: "center" }}>lire le livre</Text>
    </TouchableOpacity>

    {/* <TouchableOpacity 
      style={{
        borderWidth: 0.7,
        borderColor: '#c0c0c0',
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 10,
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, // Pour Android
      }} 
      onPress={handleHearPress}
    >
      <Image
        source={require('../assets/images/casque-de-musique.png')}
        style={{ width: 30, height: 30, marginRight: 8 }}
      />
      <Text style={{ fontSize: 14, color: "black", textAlign: "center" }}>Ecouter</Text>
    </TouchableOpacity> */}

    </View>
  )}
      {book.is_serie && (
  <View style={{flex: 0.3, backgroundColor: '#fff', borderWidth:1, padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomColor: '#f9f9f9', borderBottomWidth: 8}}>
    <View style={{marginTop: 9, flex: 0.7}}>
      <Text style={{color: 'black', fontSize: 11}}>Ne manquez pas le prochain épisode 🔔</Text>
      <Text style={{color: 'black', fontSize: 8}}>Un nouvel épisode est publié chaque semaine</Text>
    </View>
    <View style={{flexDirection: 'row', flex: 0.35}}>
      <TouchableOpacity onPress={() => setShowEpisodes(!showEpisodes)} style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{fontWeight: 'bold', color: '#5cdcf3', marginLeft: 5}}>{book.episodes.length} épisodes</Text>
        <Feather name={showEpisodes ? "chevron-up" : "chevron-down"} size={18} color="gray" style={{marginLeft: 3}}/>
      </TouchableOpacity>
    </View>
  </View>
)}
{/* {showEpisodes && (
  <View style={{backgroundColor: '#fff', padding: 16, borderBottomColor: '#f9f9f9', borderBottomWidth: 8, borderWidth:1}}>
    <FlatList
      data={episodes}
      renderItem={renderEpisode}
      keyExtractor={(item, index) => index.toString()}
      nestedScrollEnabled={true}
      scrollEnabled={false}
      style={{ maxHeight: 500 }}
    />
  </View>
)} */}
      <View style={[{flex:0.3,backgroundColor:'#fff',padding:16,borderBottomColor:'#f9f9f9',borderBottomWidth:8}]}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'description' && styles.activeTab]}
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText,{marginLeft:16}]}>Revues({reviews.length})</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'description' ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.summary} numberOfLines={showFullDescription ? undefined : 8}>{book.summary}</Text>
          <TouchableOpacity onPress={handleReadMore}>
            <Text style={styles.readMoreText}>{showFullDescription ? 'Lire moins' : 'Lire plus'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.reviewsContainer}>
          {book.revues && book.revues.length > 0 ? (
            <FlatList
              data={reviews} // Le tableau des revues
              keyExtractor={(item, index) => index.toString()} // Utilisation d'une clé unique pour chaque item
              nestedScrollEnabled={true}
              renderItem={renderReview} // Fonction de rendu des revues
              ListEmptyComponent={() => (
                <Text>Aucune revue pour l'instant</Text> // Message lorsqu'il n'y a pas de revue
              )}
              extraData={reviews} // Mise à jour automatique lorsque les données changent
            />
          ) : (
            <Text style={styles.noReviewsText}>Aucune revue disponible.</Text>
          )}
        </View>
      )}
      </View>
        <View style={[{flex:0.3, backgroundColor:'#fff', padding:16, borderBottomColor:'#f9f9f9', borderBottomWidth:8}]}>
          <View style={{marginTop:9}}>
            <Text style={{color:'black', fontSize:14, fontWeight:'bold'}}>Caractéristiques et détails</Text>
            <Text style={{color:'gray', fontSize:12, marginTop:9}}>
              {book.caracteristiques.nbr_pages} pages | {book.caracteristiques.annee} édition {book.caracteristiques.edition} | format {book.caracteristiques.format}
            </Text>
          </View>
        </View>

      <View style={[{flex:0.3,backgroundColor:'#fff',padding:16,flexDirection:'row',alignItems:'center'}]}>
        <View style={{flex:0.7}}>
        <Text style={{color:'black', fontSize:14, fontWeight:'bold'}}>A propos de l'auteur</Text>
        </View>
      </View>

      <View style={{height:80, backgroundColor:'#132d59', width:'100%',justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:8}}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:"space-around"}}>
          <Image source={authorInfo.photo ? { uri: authorInfo.photo } : require('../assets/images/auteur.png')}  style={{width:48,height:48,borderColor:'lightgray',borderWidth:0.7,borderRadius:50}}/>
          <View style={{marginLeft:8}}>
            <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>{authorInfo.name}</Text>
            <Text style={{fontSize:10, color:'white'}}>{authorInfo.metier}</Text>
          </View>
        </View>
        <View style={{marginLeft:16}}>
          <TouchableOpacity style={{marginLeft:8, backgroundColor:'#0cc0df',padding:5,width:100, borderRadius:50,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <Feather name="bell" size={14} color="white" style={{marginLeft:3}}/>
            <Text style={{color:'white',textAlign:'center',fontSize:8,marginLeft:8}}>S'abonner</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[{flex:0.3,backgroundColor:'#fff',padding:16,borderBottomColor:'#f9f9f9',borderBottomWidth:8}]}>
        
        
        <Text style={styles.summary} numberOfLines={showFullDescriptionAuteur ? undefined : 8}>{authorInfo.bio}</Text>
          <TouchableOpacity onPress={handleReadMoreAuteur}>
            <Text style={styles.readMoreText}>{showFullDescriptionAuteur ? 'Lire moins' : 'Lire plus'}</Text>
          </TouchableOpacity>
      </View>

      <View style={[{flex:0.3,backgroundColor:'#fff',padding:16,flexDirection:'row',alignItems:'center'}]}>
        <View style={{flex:0.7}}>
        <Text style={{color:'black', fontSize:14, fontWeight:'bold'}}>Recommendations</Text>
        </View>
      </View>
      <View style={{backgroundColor:'white'}}>
          <FlatList
            data={mostRead}
            keyExtractor={item => item.id}
            renderItem={renderBook}
            contentContainerStyle={styles.listContainer}
            horizontal
            showsHorizontalScrollIndicator={false}   
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
        <Modal isVisible={isRatingModalVisible} onBackdropPress={() => setRatingModalVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <CustomRatingBar book={book} closeModal={() => setRatingModalVisible(false)} />
        </View>
        </Modal>
        </KeyboardAvoidingView>
        
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent:'center',
  },
  closeButton: {
    borderRadius: 4,
    padding: 2,
    height: 30,
    marginTop: 8,
    marginLeft: 4,
    flex:0.3
  },
  listContainer: {
    padding: 10,
    backgroundColor:'white'
    //height:'100%'
  },
  action:{
    marginTop: 24,
  },
  coverImage: {
    width: 150,
    height: 230,
    marginRight: 8,
    borderRadius:10,
  },
  summary: {
    fontSize: 14,
    marginVertical: 8,
    color: 'gray'
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
    fontSize: 24,
    textAlign: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    // alignItems: 'center',
    paddingRight:16
  },
  outerCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    marginTop:5
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#5cdcf3',
  },
  radioText: {
    fontSize: 12,
    fontWeight:'bold',
    color:'black',
    width:100
  },
  button: {
    backgroundColor: '#12c066',
    padding: 10,
    borderRadius: 50,
    width:110,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight:'bold',
    textAlign:'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'white',
    width:120,
    marginVertical:8
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: '#0cc0df',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
    fontWeight:'bold'
  },
  activeTabText: {
    color: 'black',
  },
  descriptionContainer: {
    paddingTop:8
  },
  readMoreText: {
    color: '#0cc0df',
    marginTop: 10,
    marginRight:4,
    textAlign: 'right',
    fontWeight:'bold'
  },
  reviewsContainer: {
    paddingVertical: 12,
  },
  noReviewsText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  bookContainer: {
    marginHorizontal: 10,
    //height:'100%'
  },
  bookCover: {
    width: 80,
    height: 125,
    borderRadius: 5,
  },
  bookTitle: {
    fontSize: 12,
    color: '#000',
  },
  textarea: {
    height: 150,
    width: '100%',
    borderRadius: 5,
    padding: 10,
    color: '#000', 
    backgroundColor: '#f5f5f5', 
    marginBottom: 20
  },
  reviewContainer: {

    marginBottom: 10,
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  reviewContent: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color:'black'
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    paddingVertical:8,
    borderBottomWidth:0.3,
    borderBottomColor:'lightgray'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookDetails;


BookDetails.tsx
// import React, { useState } from 'react';
// import { ScrollView, RefreshControl, StatusBar } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import BookHeader from './components/BookHeader';
// import PurchaseSection from './components/PurchaseSection';
// import ContentTabs from './components/ConentTabs';
// import BookMetadata from './components/BookMetadata';
// import AuthorSection from './components/AuthorSection';
// import Recommendations from './components/Recommendations';
// import RatingModal from './components/RatingModal';
// import  useBookDetails  from './hooks/useBookDetails';
// import  usePurchase  from './hooks/usePurchase';
// import  useFavorite  from './hooks/useFavorite';
// import ReadActionsSection from './components/ReadActionsSection';
// import EpisodesSection from './components/EpisodesSection';
// import BookDescription from './components/BookDescription';
// import ReviewsList from './components/ReviewsList';

// const BookDetails = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { book: initialBook } = route.params;
//   const handlePress = (book) => {
//     navigation.navigate('BookDetails', { book });
// };
//   const {
//     currentBook,
//     refreshing,
//     onRefresh,
//     authorInfo,
//     canRead,
//     mostRead,
//     averageNote,
//     episodes,
//     showEpisodes,
//     setShowEpisodes,
//     reviews,
//     activeTab,
//     setActiveTab,
//     showFullDescription,
//     setShowFullDescription,
//     showFullDescriptionAuteur,
//     setShowFullDescriptionAuteur
//   } = useBookDetails(initialBook);

//   const { handleSubscriptionOrBuy, isLoading } = usePurchase(currentBook, navigation);
//   const { isFavorite, handleAddToFavorites } = useFavorite(currentBook);
//   const [isRatingModalVisible, setRatingModalVisible] = useState(false);

//   return (
//     <ScrollView 
//       keyboardShouldPersistTaps="always"
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       <StatusBar backgroundColor="#0cc0df" barStyle="dark-content" />
      
//       <BookHeader 
//         book={currentBook}
//         authorInfo={authorInfo}
//         averageNote={averageNote}
//         canRead={canRead}
//         isFavorite={isFavorite}
//         onShare={() => {/* share logic */}}
//         onDownload={() => {/* download logic */}}
//         onFavoritePress={() => {/*handleAddToFavorites*/}}
//         onRatingPress={() => setRatingModalVisible(true)}
//       />

//       {!canRead && (
//         <PurchaseSection
//           book={currentBook}
//           isLoading={isLoading}
//           onPurchase={()=>{/*handleSubscriptionOrBuy*/}}
//         />
//       )}

//       {canRead && <ReadActionsSection onRead={() => {/* read logic */}} onHear={() => {/* hear logic */}} />}

//       {currentBook.is_serie && (
//         <EpisodesSection
//           episodes={episodes}
//           showEpisodes={showEpisodes}
//           onToggleEpisodes={() => setShowEpisodes(!showEpisodes)}
//         />
//       )}

//       <ContentTabs
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         descriptionContent={
//           <BookDescription
//             summary={currentBook.summary}
//             showFull={showFullDescription}
//             onToggle={() => setShowFullDescription(!showFullDescription)}
//           />
//         }
//         reviewsContent={
//           <ReviewsList 
//             reviews={reviews}
//             emptyText="Aucune revue disponible."
//           />
//         }
//       />

//       <BookMetadata
//         characteristics={currentBook.caracteristiques}
//       />

//       <AuthorSection
//         authorInfo={authorInfo}
//         showFullBio={showFullDescriptionAuteur}
//         onToggleBio={() => setShowFullDescriptionAuteur(!showFullDescriptionAuteur)}
//       />

//       <Recommendations onPressBook={handlePress} books={mostRead} />

//       <RatingModal
//         visible={isRatingModalVisible}
//         book={currentBook}
//         onClose={() => setRatingModalVisible(false)}
//       />
//     </ScrollView>
//   );
// };

// export default BookDetails;