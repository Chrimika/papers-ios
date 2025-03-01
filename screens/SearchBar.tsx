import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function SearchBar({ books, onBookPress }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="gray" style={{marginLeft:5}}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un livre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {searchQuery.length > 0 && (
        <FlatList
          data={filteredBooks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.bookContainer} onPress={() => onBookPress(item)}>
              <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
              <Text style={styles.bookTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.searchResults}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#f5f5f5',
    width:'90%',
    borderRadius:10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderBottomColor: '#ccc',
    borderBottomWidth:0.5
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color:'black'
  },
  searchResults: {
    padding: 10,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookCover: {
    height: 50,
    width: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  bookTitle: {
    fontSize: 16,
    color: '#000',
  },
});
