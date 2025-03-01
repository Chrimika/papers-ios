import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView, Linking } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager } from 'react-native-fbsdk-next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import Toast from 'react-native-root-toast';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { ActivityIndicator } from 'react-native-paper';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import FastImage from 'react-native-fast-image';




export default function ProfileScreen() {
  const { sharedState, setSharedState } = useAppContext();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsByDate, setTransactionsByDate] = useState({});

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
    const userId = sharedState.user.uid;

    const fetchTransactions = async () => {
      try {
        const unsubscribe = firestore()
          .collection('ventes_direct')
          .where('user', '==', userId)
          .orderBy('date', 'desc') // Tri par date décroissante (du plus récent au plus ancien)
          .onSnapshot(async snapshot => {
            const transactions = await Promise.all(
              snapshot.docs.map(async doc => {
                const transactionData = doc.data();
                const livreSnapshot = await firestore()
                  .collection('livres')
                  .doc(transactionData.livre) // Cherche dans 'livres' par l'ID du livre
                  .get();
                const livreData = livreSnapshot.data();
                return {
                  id: doc.id,
                  ...transactionData,
                  coverUrl: livreData?.coverUrl || null,
                  name: livreData?.name || null,
                };
              })
            );
    
            // Regrouper les transactions par jour
            const groupedTransactions = transactions.reduce((acc, transaction) => {
              const transactionDate = format(new Date(transaction.date.toDate()), "eeee d MMMM yyyy", { locale: fr });
              if (!acc[transactionDate]) {
                acc[transactionDate] = [];
              }
              acc[transactionDate].push(transaction);
              return acc;
            }, {});
    
            setTransactionsByDate(groupedTransactions);
          });
    
        return unsubscribe; // Retourne l'unsubscribe pour l'utiliser quand nécessaire (ex: lors du démontage du composant)
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (timestamp) => {
    // Convertir le timestamp Firebase en millisecondes
    const date = new Date(timestamp.seconds * 1000);

    // Formater la date en fonction du fuseau horaire local
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Douala', // Remplacez par votre fuseau horaire
        hour: '2-digit',
        minute: '2-digit'
    });

    // Retourner l'heure formatée (par exemple : 14:30)
    return formatter.format(date);
};

  const handleLogout = async () => {
    try {
      const currentUser = auth().currentUser;
      console.log('Current User:', currentUser);
      if (currentUser) {
        const uid = currentUser.uid;
        const providerId = currentUser.providerData[0].providerId;

        if (providerId === 'google.com') {
          await GoogleSignin.signOut();
        } else if (providerId === 'facebook.com') {
          LoginManager.logOut();
        }

        await auth().signOut();

        // Met à jour le champ `isConnected` à false dans Firestore
        await firestore().collection('users').doc(uid).update({ isConnected: false });

        await AsyncStorage.removeItem('user');
        setSharedState((prevState) => ({
          ...prevState,
          user: null,
        }));
        navigation.navigate('login');
        Toast.show('Successfully logged out!');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      Toast.show('Error logging out, please try again.');
    }
  };

  const openAuthorPage = () => {
    Linking.openURL('https://papers.seedsoftengine.com/Landing-auteurs/');
  };

  const openAuthorSpace = () => {
    Linking.openURL('https://papers.seedsoftengine.com/papers-auteurs/');
  };
  

  // const Logout = async () => {
  //   try {
  //     // Effacer toutes les données dans AsyncStorage
  //     await AsyncStorage.clear();
  
  //     // Naviguer vers l'écran de login
  //     const navigation = useNavigation();
  //     navigation.replace('Login'); // Remplace 'Login' par le nom exact de ton écran de connexion
  
  //   } catch (error) {
  //     console.error('Erreur lors de la déconnexion', error);
  //   }
  // };

  if (!user) {
    return (
      <View style={{justifyContent:'center',flex:1}}>
        <ActivityIndicator size="large" color="#3EEE00" />
      </View>
    );
  }

  const renderTransactionItem = (transaction) => {
    // Définir la couleur en fonction de l'état
    let prixColor;
    let etatColor;
    
    switch (transaction.etat) {
      case 'en cours':
        prixColor = 'orange';
        etatColor = 'orange';
        break;
      case 'reussi':
        prixColor = 'green';
        etatColor = 'green';
        break;
      case 'echec':
        prixColor = 'red';
        etatColor = 'red';
        break;
      default:
        prixColor = 'black'; // Couleur par défaut
        etatColor = 'black'; // Couleur par défaut
    }
  
    return (
      <View style={styles.transactionItem}>
          <FastImage
            source={{ uri: transaction.coverUrl }}
            style={styles.bookImage}
            resizeMode={FastImage.resizeMode.cover}
          />        
          <View style={styles.transactionInfo}>
          <View style={{flex:2.5}}>
            <Text 
              style={{ fontWeight: "bold", color: 'black', fontSize: 16, maxWidth: 160 }} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {transaction.name}
            </Text>
            {/* Couleur de l'état de la transaction */}
            <Text style={[styles.transactionText, { color: etatColor }]}>{transaction.etat}</Text>
          </View>
          <View style={{ marginLeft: 20 , flex:1}}>
            {/* Couleur du prix en fonction de l'état */}
            <Text style={{ fontWeight: "bold", color: prixColor }}>{transaction.prix} FCFA</Text>
            <Text style={{ color: 'black', marginVertical: 4 }}>{formatDate(transaction.date)}</Text>
          </View>
        </View>
      </View>
    );
  };
  

  const renderTransactionsByDate = ({ item: [date, transactions] }) => (
    <View key={date} style={styles.transactionGroup}>
      <Text style={styles.dateHeader}>{date}</Text>
      {transactions.map(transaction => renderTransactionItem(transaction))}
    </View>
  );
  const groupedTransactionArray = Object.entries(transactionsByDate); // Transforme l'objet en tableau pour FlatList


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* <TouchableOpacity onPress={() => navigation.navigate('fav')}>
          <Feather name='chevron-left' size={30} color={'black'} style={{ marginTop: 10, marginLeft: 8 }} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user.image && user.image.length > 0 ? (
          <FastImage
            source={{ uri: user.image }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require('../assets/images/auteur.png')}
            style={styles.profileImage}
          />
          )}
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.name}>{user.uname}</Text>
              <Text style={styles.email}>{user.adresse}</Text>
            </View>
          </View>
          <View style={{ justifyContent: 'center', alignItems: "center" }}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 16, backgroundColor: '#ffffff', marginTop: 16 }}>
          <Text style={{ fontSize: 24, color: 'black', fontWeight: '600' }}>Transactions</Text>
          <FlatList
            data={groupedTransactionArray}
            keyExtractor={(item) => item[0]} // Utilise la date comme clé
            renderItem={renderTransactionsByDate}
            scrollEnabled={false} // Désactive le défilement interne de la FlatList
            ListEmptyComponent={
              <Text style={{ fontSize: 16, color: 'gray', marginTop: 16 }}>
                Aucune transaction en cours ou effectuée
              </Text>
            }
          />
        </View> */}
        <View style={{padding:8,marginTop: 40}}>
          <Text style={styles.headerTitle}>Profil</Text>
          <Text style={styles.headerUnderline}></Text>
        </View>
        <View style={{justifyContent: 'center',alignItems:'center',marginTop:32}}>
          <View>
            {user.image && user.image.length > 0 ? (
            <FastImage
              source={{ uri: user.image }}
              style={styles.profileImage}
            />
          ) : (
            <Image
              source={require('../assets/images/auteur.png')}
              style={styles.profileImage}
            />
            )}
            
            
          </View>
          <View style={{justifyContent:'center',alignItems:'center',paddingTop:4}}>
              <Text style={styles.name}>{user.uname}</Text>
              <Text style={styles.email}>{user.adresse}</Text>
          </View>
          
        </View>
        <View style={{marginTop:32,padding:8}}>
              <TouchableOpacity onPress={handleLogout} style={{borderWidth:1,borderColor:'#f0f0f0',padding:16,justifyContent:'space-between',flexDirection:'row',borderRadius:8}}>
                <View>
                  <Text style={{color:'black'}}>Déconnexion</Text>
                </View>
                <View>
                  <Feather name='log-out' color={'black'} size={18} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={openAuthorPage} style={{borderWidth:1,borderColor:'#f0f0f0',padding:16,justifyContent:'space-between',flexDirection:'row',borderRadius:8,marginTop:8}}>
                <View>
                  <Text style={{color:'black'}}>Devenir auteur | éditeur</Text>
                </View>
                <View>
                  <Feather name='pen-tool' color={'black'} size={18}  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={openAuthorSpace} style={{borderWidth:1,borderColor:'#f0f0f0',padding:16,justifyContent:'space-between',flexDirection:'row',borderRadius:8,marginTop:8}}>
                <View>
                  <Text style={{color:'black'}}>Compte auteur | éditeur</Text>
                </View>
                <View>
                  <Feather name='arrow-up-right' color={'black'} size={18}  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{borderWidth:1,borderColor:'#f0f0f0',padding:16,justifyContent:'space-between',flexDirection:'row',borderRadius:8,marginTop:8}}>
                <View>
                  <Text style={{color:'black'}}>Transactions</Text>
                </View>
                <View>
                  <Feather name='credit-card' color={'black'} size={18}  />
                </View>
              </TouchableOpacity>
              <FlatList
                data={groupedTransactionArray}
                keyExtractor={(item) => item[0]}
                renderItem={renderTransactionsByDate}
                scrollEnabled={false} 
                style={{marginLeft:8}}
                ListEmptyComponent={
                  <Text style={{ fontSize: 16, color: 'gray', marginTop: 16 }}>
                    Aucune transaction en cours ou effectuée
                  </Text>
                }
              />
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 0.1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding:10
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  headerUnderline: {
    width: 40,
    borderColor: "#0cc0df",
    borderTopWidth: 4,
    height: 0,
    borderRadius: 50,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'black',
  },
  email: {
    fontSize: 11,
    color: 'black',
  },
  logoutButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    width:100
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign:'center',
    fontWeight:"600"
  },
  foot: {
    width: '100%',
    backgroundColor: "#f5f5f5",
    borderTopWidth: 0.3,
    paddingVertical: 10,
    borderTopColor: "gray",
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  tab1: {
    flex:1/3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab2: {
    flex:1/3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab3: {
    flex:1/3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: 'black',
  },
  dateHeader: {
    fontSize:14,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'gray',
  },
  transactionGroup: {
    marginBottom: 20,
    marginTop:24,

  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop:16
  },
  bookImage: {
    width: 40,
    height: 60,
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
    justifyContent:'space-between',
    flexDirection:'row',
    borderBottomColor:'#ccc',
    borderBottomWidth:0.8,
    paddingVertical:8,
    marginLeft:10
  },
  transactionText: {
    color: 'black',
    fontSize: 13,
  },

});
