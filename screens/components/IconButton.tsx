import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onPress, 
  size = 24, 
  color = '#fff' 
}) => {
  // Vérifie si l'icône appartient à Feather ou FontAwesome
  const IconComponent = 
    Feather.hasIcon(icon) ? Feather : 
    FontAwesome.hasIcon(icon) ? FontAwesome : 
    Feather;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconComponent 
        name={icon} 
        size={size} 
        color={color} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginVertical: 4,
  },
});

export default IconButton;