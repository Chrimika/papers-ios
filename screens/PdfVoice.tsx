// import React, { useEffect, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Image, 
//   ActivityIndicator, 
//   TouchableOpacity, 
//   ScrollView, 
//   Alert
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// //import Tts from 'react-native-tts';
// import Feather from 'react-native-vector-icons/Feather';

// Tts.setDefaultLanguage('fr-FR');
// Tts.setDefaultRate(0.5);
// Tts.setDefaultPitch(1);

// const CHUNK_SIZE = 300;
// const STORAGE_KEY = '@reading_progress';

// const PdfTextExtractor = ({ route, navigation }) => {
//   const { book } = route.params;
//   const [textChunks, setTextChunks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isPaused, setIsPaused] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const isMounted = useRef(true);

//   // Chargement initial
//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         // Essayer de charger depuis le cache
//         const cachedText = await AsyncStorage.getItem(`pdf_${book.id}_text`);
        
//         if (cachedText) {
//           processText(cachedText);
//           await loadProgress();
//         } else {
//           await fetchTextFromServer();
//         }
//       } catch (error) {
//         Alert.alert('Erreur', 'Impossible de charger le texte');
//       }
      
//       setLoading(false);
//     };

//     initialize();

//     return () => {
//       isMounted.current = false;
//       Tts.stop();
//       saveProgress();
//     };
//   }, []);

//   const fetchTextFromServer = async () => {
//     try {
//       const formData = new FormData();
//       formData.append('pdf_url', book.pdfUrl);

//       const response = await fetch('https://papers.seedsoftengine.com/PdfToText/converter.php', {
//         method: 'POST',
//         body: formData,
//         headers: { 'Accept': 'application/json' },
//         agent: new https.Agent({ rejectUnauthorized: false })
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error);

//       const cleanedText = data.text
//         .replace(/([.,!?;:])(?=[A-Za-zÀ-ÿ])/g, '$1 ')
//         .replace(/\s+/g, ' ')
//         .trim();

//       await AsyncStorage.setItem(`pdf_${book.id}_text`, cleanedText);
//       processText(cleanedText);
//     } catch (error) {
//       Alert.alert('Erreur', error.message);
//     }
//   };

//   const processText = (text) => {
//     const chunks = [];
//     for (let i = 0; i < text.length; i += CHUNK_SIZE) {
//       chunks.push(text.slice(i, i + CHUNK_SIZE));
//     }
//     setTextChunks(chunks);
//   };

//   const saveProgress = async () => {
//     try {
//       await AsyncStorage.setItem(`${STORAGE_KEY}_${book.id}`, currentIndex.toString());
//     } catch (error) {
//       console.error('Erreur sauvegarde progression:', error);
//     }
//   };

//   const loadProgress = async () => {
//     try {
//       const savedIndex = await AsyncStorage.getItem(`${STORAGE_KEY}_${book.id}`);
//       setCurrentIndex(savedIndex ? parseInt(savedIndex, 10) : 0);
//     } catch (error) {
//       console.error('Erreur chargement progression:', error);
//     }
//   };

//   const playNextChunk = async (index) => {
//     if (!isMounted.current || index >= textChunks.length || isPaused) return;

//     try {
//       await new Promise((resolve) => {
//         Tts.speak(textChunks[index], {
//           onDone: () => {
//             setCurrentIndex(index + 1);
//             resolve();
//           },
//           onError: (error) => {
//             console.log('Erreur TTS:', error);
//             resolve();
//           }
//         });
//       });

//       if (isMounted.current) {
//         playNextChunk(index + 1);
//       }
//     } catch (error) {
//       console.log('Erreur lecture:', error);
//     }
//   };

//   const togglePlayPause = async () => {
//     if (isPaused) {
//       setIsPaused(false);
//       await playNextChunk(currentIndex);
//     } else {
//       setIsPaused(true);
//       Tts.stop();
//       await saveProgress();
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Feather name="chevron-left" size={30} color="black" />
//       </TouchableOpacity>

//       <Image source={{ uri: book?.coverUrl }} style={styles.coverImage} resizeMode="contain" />

//       {loading ? (
//         <ActivityIndicator size="large" color="#0cc0df" />
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           <Text style={styles.textPreview}>
//             {textChunks.slice(currentIndex, currentIndex + 3).join(' ')}
//           </Text>
//         </ScrollView>
//       )}

//       <View style={styles.controls}>
//         <TouchableOpacity 
//           onPress={togglePlayPause} 
//           style={styles.controlButton}
//           disabled={loading}
//         >
//           <Image
//             source={
//               isPaused 
//                 ? require('../assets/images/bouton-jouer.png')
//                 : require('../assets/images/bouton-pause.png')
//             }
//             style={styles.buttonIcon}
//           />
//           <Text style={styles.progressText}>
//             {Math.round((currentIndex / textChunks.length) * 100)}% complété
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   coverImage: {
//     width: 250,
//     height: 350,
//     alignSelf: 'center',
//     marginVertical: 20,
//     borderRadius: 8,
//   },
//   scrollContainer: {
//     paddingBottom: 100,
//   },
//   textPreview: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#333',
//   },
//   controls: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   controlButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 15,
//   },
//   buttonIcon: {
//     width: 40,
//     height: 40,
//   },
//   progressText: {
//     fontSize: 14,
//     color: '#666',
//   },
// });

// export default PdfTextExtractor;