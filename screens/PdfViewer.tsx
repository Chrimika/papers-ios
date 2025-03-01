import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, Platform} from 'react-native';

const {SecurityModule} = NativeModules;

const PdfViewer = ({ route }) => {
  const { pdfUrl } = route.params;
  const [initialPage, setInitialPage] = useState(0); // Page de démarrage
  const [numberOfPages, setNumberOfPages] = useState(0); // Nombre de pages

  // Clé pour stocker la dernière page lue dans AsyncStorage
  const lastPageKey = `${pdfUrl}_lastPage`;

  useEffect(() => {
    // Charger la dernière page lue depuis AsyncStorage
    const loadLastPage = async () => {
      try {
        const savedPage = await AsyncStorage.getItem(lastPageKey);
        if (savedPage !== null) {
          setInitialPage(parseInt(savedPage, 10));
        }
      } catch (error) {
        console.error('Failed to load last page:', error);
      }
    };

    loadLastPage();
  }, [pdfUrl]);

  const handlePageChanged = async (page) => {
    // Sauvegarder la page courante dans AsyncStorage
    try {
      await AsyncStorage.setItem(lastPageKey, page.toString());
      console.log(`Current page saved: ${page}`);
    } catch (error) {
      console.error('Failed to save current page:', error);
    }
  };

  if (!pdfUrl) {
    return (
      <View style={styles.container}>
        <Text>Failed to load PDF.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: pdfUrl }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
          setNumberOfPages(numberOfPages); // Mise à jour du nombre de pages
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
          handlePageChanged(page); // Sauvegarder la dernière page lue
        }}
        onError={(error) => {
          console.error('PDF load error:', error);
        }}
        enablePaging={true}
        scale={1.0}
        minScale={0.5}
        maxScale={3.0}
        style={styles.pdf}
        activityIndicator={<ActivityIndicator size="large" color="#0000ff" />}
        page={initialPage} // Commencer la lecture à partir de la dernière page lue
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#f5f5f5',
  },
});

export default PdfViewer;
