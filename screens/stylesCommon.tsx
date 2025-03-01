// stylesCommon.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const commonStyles = StyleSheet.create({
  bookCover: {
    height: 200,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width:'100%'
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#fff',

    color: '#000',
  },
  modalImage: {
    width: width*0.65,
    height: 400,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
    marginTop:20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color:'black'
  },
  modalPrice: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSummary: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default commonStyles;
