import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'



const MyButton = ({title,onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.googleButton}>
        <Text style={{color:'white',fontSize:16}}>{title}</Text>
    </TouchableOpacity>
  )
}

export default MyButton

const styles = StyleSheet.create({
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0cc0df',
        borderRadius:10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        justifyContent:'center',
      },
})