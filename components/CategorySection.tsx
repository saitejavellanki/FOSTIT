// components/CategorySection.tsx
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles } from '../app/Mis/styles';
import { CategorySectionProps, MenuItem } from '../app/Mis/types';

export const CategorySection: React.FC<CategorySectionProps> = ({ title, items, onItemPress, addToCart }) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.categorySection}>
      <ThemedText type="subtitle" style={styles.categoryTitle}>{title}</ThemedText>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.menuItem, !item.isActive && styles.inactiveItem]}
          onPress={() => onItemPress(item)}
          disabled={!item.isActive}
        >
          <View style={styles.menuItemContent}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.menuItemImage}
            />
            <View style={styles.menuItemInfo}>
              <View style={styles.menuItemHeader}>
                <ThemedText type="subtitle">{item.name}</ThemedText>
                <View style={[
                  styles.dietTypeBadge,
                  { backgroundColor: item.dietType === 'veg' ? '#48c479' : '#ff4d4d' }
                ]}>
                  <ThemedText style={styles.dietTypeText}>
                    {item.dietType === 'veg' ? 'Veg' : 'Non-Veg'}
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </ThemedText>
              
              <View style={styles.menuItemFooter}>
                <ThemedText style={[styles.price, !item.isActive && styles.inactivePrice]}>
                  ₹{item.price.toFixed(2)}
                </ThemedText>
                
                <TouchableOpacity
                  style={[styles.addButton, !item.isActive && styles.inactiveButton]}
                  onPress={() => addToCart(item)}
                  disabled={!item.isActive}
                >
                  <ThemedText style={styles.addButtonText}>
                    {item.isActive ? 'Add' : 'Unavailable'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};