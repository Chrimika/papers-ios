import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import RNFetchBlob from 'react-native-blob-util';
//import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';


export default function Read() {
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigation = useNavigation();

  React.useEffect(() => {
    const fetchBooks = async () => {
      const booksCollection = await firestore().collection('livres').get();
      const booksList = booksCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBooks(booksList);
    };
    fetchBooks();
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

  const handlePress = async (pdfUrl, fileName) => {
    setLoading(true);
    const localPath = await downloadPDF(pdfUrl, fileName);
    setLoading(false);

    if (localPath) {
      navigation.navigate('pdfviewer', { pdfUrl: localPath });
    } else {
      console.error('Failed to download PDF.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../assets/images/logo.jpg')} style={{width:96, height:96, marginBottom:32,borderRadius:50}}/>
        <LottieView style={{width:200,height:200}} source={require('../assets/images/animations/loaderBook.json')} autoPlay loop />
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.pdfUrl, `${item.name}.pdf`)}>
            <Text style={styles.text}>{item.name} - {item.author}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    color: '#ffffff',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
