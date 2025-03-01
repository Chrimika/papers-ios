import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-root-toast';

const PaymentWebView = ({ route }) => {
  const { paymentUrl, book } = route.params;
  const navigation = useNavigation();
  const { sharedState } = useAppContext();

  // Fonction utilitaire pour extraire un paramètre de requête
  const getQueryParam = (url, param) => {
    const paramsString = url.split('?')[1];
    if (!paramsString) return null;

    const params = paramsString.split('&');
    for (const p of params) {
      const [key, value] = p.split('=');
      if (key === param) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  // Gérer les redirections
  const handleRedirect = async (url) => {
    console.log('URL de redirection :', url);

    // -- Succès --
    if (url.startsWith('https://silly-babka-5c39a4.netlify.app/pages/succes.html')) {
      const currentUser = sharedState.user;
      let bookId = book.id.replace(/ /g, '_'); // Remplace les espaces par des underscores
      const bookPrice = book.price;
      const authorId = book.hauteur;

      try {
        // 1) Récupérer l'id_transaction
        const id_transaction = getQueryParam(url, 'id_trx_ext');
        console.log('ID de transaction externe :', id_transaction);

        // 2) Vérifier si cette transaction existe déjà
        const existingTransactionQuery = await firestore()
          .collection('ventes_direct')
          .where('id_transaction', '==', id_transaction)
          .get();

        if (!existingTransactionQuery.empty) {
          console.log('Cette transaction existe déjà. Aucun doublon créé.');
          return;
        }

        // 3) Mettre à jour l'utilisateur
        const userRef = firestore().collection('users').doc(currentUser.uid);
        await userRef.update({
          buyed: firestore.FieldValue.arrayUnion(bookId),
        });

        // 4) Vérifier si une vente avec bookId + user.uid existe déjà
        const ventesRef = firestore().collection('ventes_direct');
        const existingVenteQuery = await ventesRef
          .where('id', '==', bookId + currentUser.uid)
          .get();

        if (existingVenteQuery.empty) {
          // Pas de vente, on crée une nouvelle
          const venteData = {
            user: currentUser.uid,
            auteur: authorId,
            date: new Date(),
            livre: bookId,
            moyen: 'OM',
            prix: bookPrice,
            id_transaction,
            etat: 'reussi',
          };

          await ventesRef.add(venteData);
          console.log('Nouvelle vente ajoutée avec succès !');
        } else {
          // Vente existante, on met à jour
          existingVenteQuery.forEach(async (doc) => {
            await ventesRef.doc(doc.id).update({
              date: new Date(),
              moyen: 'OM',
              id_transaction,
              etat: 'reussi',
            });
          });
          console.log('Vente existante mise à jour avec succès !');
        }

        // Toast de confirmation
        Toast.show('Votre achat a été effectué avec succès', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });

        navigation.navigate('BookDetails', { book });
      } catch (error) {
        console.error("Erreur lors de l'achat : ", error);
        Toast.show('Une erreur est survenue lors de l’achat', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    }

    // -- Échec ou autre redirection --
    else if (url.startsWith('https://silly-babka-5c39a4.netlify.app/pages/echec.html')) {
      console.log('Échec du paiement');
      navigation.navigate('fav');
    } else if (url.startsWith('https://silly-babka-5c39a4.netlify.app/pages/transactions.html')) {
      console.log('Redirection vers les transactions');
      navigation.navigate('profile');
    } else if (url.startsWith('https://silly-babka-5c39a4.netlify.app/pages/mesLivres.html')) {
      console.log('Redirection vers mes livres');
      navigation.navigate('fav');
    }
  };

  // Ouvrir le site de paiement dans Safari
  useEffect(() => {
    if (paymentUrl) {
      Linking.openURL(paymentUrl).catch((err) => {
        console.error('Erreur lors de l’ouverture du lien :', err);
        Alert.alert('Erreur', 'Impossible d’ouvrir le lien de paiement');
      });
    }
  }, [paymentUrl]);

  // Écouter les redirections
  useEffect(() => {
    const handleUrlChange = (event) => {
      const { url } = event;
      handleRedirect(url);
    };

    Linking.addEventListener('url', handleUrlChange);

    return () => {
      Linking.removeEventListener('url', handleUrlChange);
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentWebView;