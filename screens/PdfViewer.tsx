import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewer = ({ route }) => {
  const { pdfUrl } = route.params;
  const [loading, setLoading] = useState(true); // État pour gérer le chargement

  return (
    <View style={styles.container}>
      {/* Afficher un indicateur de chargement pendant que le PDF se charge */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Afficher le PDF */}
      <Pdf
        source={{ uri: pdfUrl }} // Utilisez directement l'URL du PDF
        onLoadComplete={(numberOfPages) => {
          console.log(`Number of pages: ${numberOfPages}`);
          setLoading(false); // Désactiver le chargement une fois le PDF chargé
        }}
        onError={(error) => {
          console.error('PDF load error:', error);
          setLoading(false); // Désactiver le chargement en cas d'erreur
        }}
        style={styles.pdf}
        enablePaging={true} // Active la pagination
        horizontal={true} // Navigation horizontale entre les pages
        fitWidth={true} // Ajuste la largeur de chaque page à l'écran
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
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fond semi-transparent pour l'indicateur de chargement
  },
});

export default PdfViewer;