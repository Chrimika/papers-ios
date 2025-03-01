import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
import { useAppContext } from '../AppContext'; // Assurez-vous d'importer votre contexte

const BuyBookScreen = () => {
  const route = useRoute();
  const { book } = route.params; // Récupération des données du livre
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const { sharedState } = useAppContext(); // Assurez-vous que le contexte est bien défini

  const handlePurchase = async () => {
    const currentUser = sharedState.user; // Utilisateur actuel depuis le contexte
    const bookId = book.id; // ID du livre acheté
    const bookPrice = book.price; // Prix du livre
    const authorId = book.hauteur; // Référence vers l'auteur

    if (!currentUser || !currentUser.uid) {
      console.error("Utilisateur non authentifié");
      return;
    }

    try {
      // 1) Mettre à jour l'utilisateur avec l'ID du livre acheté
      const userRef = firestore().collection('users').doc(currentUser.uid);
      await userRef.update({
        buyed: firestore.FieldValue.arrayUnion(bookId)
      });

      // 2) Ajouter une nouvelle vente dans "ventes_direct"
      const venteData = {
        auteur: authorId,
        date: new Date(),
        livre: bookId,
        moyen: "OM",
        prix: bookPrice
      };

      await firestore().collection('ventes_direct').add(venteData);

      // 3) Afficher un écran de confirmation puis rediriger après 5 secondes
      setModalVisible(true);  // Afficher un modal avec message de succès
      setTimeout(() => {
        setModalVisible(false);  // Fermer le modal
        navigation.navigate('BookDetails', { book });  // Redirection vers la page des détails du livre
      }, 5000); // Rediriger après 5 secondes
    } catch (error) {
      console.error("Erreur lors de l'achat : ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/OM.png')} 
        style={styles.logo} 
      />

      <Text style={styles.title}>ACHAT DU LIVRE</Text>
      <Text style={{ color:'#5cdcf3', fontSize:24, fontWeight:'bold' }}>{book.name}</Text>
      <Text style={styles.price}>{book.price} XAF</Text>

      <Text style={styles.description}>En achetant ce livre, vous bénéficierez d'un accès à vie. Lisez-le à tout moment, autant de fois que vous le souhaitez, sans aucune limite.</Text>

      <Text style={styles.label}>Numero OM</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Entrez votre numéro"
        keyboardType="numeric"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TouchableOpacity style={styles.button} onPress={handlePurchase}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>

      {/* Modal pour afficher l'achat réussi */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'green' }}>Achat effectué avec succès !</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  price: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6600',
    marginVertical: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    color: '#000',
  },
  label: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 48,
    backgroundColor: '#f6f6f6',
    color: '#000',
  },
  button: {
    width: '35%',
    padding: 15,
    backgroundColor: '#34C759',
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default BuyBookScreen;
