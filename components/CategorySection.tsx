import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles } from '../app/Mis/styles';

export const CategorySection = ({
  title,
  items,
  onItemPress,
  addToCart
}) => {
  if (items.length === 0) return null;

  const renderDietIndicator = (dietType) => (
    <View
      style={{
        width: 16,
        height: 16,
        padding: 2,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: dietType === 'veg' ? '#008000' : '#FF0000',
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <View 
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dietType === 'veg' ? '#008000' : '#FF0000',
        }}
      />
    </View>
  );

  const renderRating = (rating, ratings) => {
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating - filledStars >= 0.5;
    const reviewCount = ratings?.length || 0;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <ThemedText 
            key={index} 
            style={{ 
              fontSize: 12,
              color: index <= filledStars 
                ? '#FFB800' 
                : (index === filledStars + 1 && hasHalfStar)
                  ? '#FFB800'
                  : '#D1D5DB'
            }}
          >
            {(index === filledStars + 1 && hasHalfStar) ? '★' : '★'}
          </ThemedText>
        ))}
        <ThemedText style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>
          ({reviewCount})
        </ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.categorySection}>
      <ThemedText type="subtitle" style={styles.categoryTitle}>
        {title}
      </ThemedText>
      
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.menuItem, !item.isActive && styles.inactiveItem]}
          onPress={() => onItemPress(item)}
          disabled={!item.isActive}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.menuItemImage}
          />

          <View style={styles.menuItemInfo}>
            <View style={styles.menuItemHeader}>
              
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                
                <ThemedText
                  type="subtitle"
                  style={[styles.itemName, { flex: 1 }]}
                  numberOfLines={1}
                >
                  {item.name}
                </ThemedText>
                {item.averageRating && (
                <View style={{ marginTop:-4}}>
                  {renderRating(item.averageRating, item.ratings)}
                </View>
              )}
                {renderDietIndicator(item.dietType)}
              </View>
              
            </View>

            <ThemedText
              style={[styles.menuItemDescription, { marginTop: 4 }]}
              numberOfLines={2}
            >
              {item.description}
            </ThemedText>

            <View style={[styles.menuItemFooter, { marginTop: 8 }]}>
              <ThemedText
                style={[
                  styles.price,
                  !item.isActive && styles.inactivePrice
                ]}
              >
                ₹{item.price.toFixed(2)}
              </ThemedText>

              <TouchableOpacity
                style={[
                  {
                    backgroundColor: '#fff',
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 0.8,
                    borderColor: '#FF9800'
                  },
                  !item.isActive && styles.inactiveButton
                ]}
                onPress={() => addToCart(item)}
                disabled={!item.isActive}
              >
                <ThemedText
                  style={[
                    {
                      color: '#FF9800',
                      fontWeight: '500',
                      fontSize: 13,
                      letterSpacing: 0.2,
                    },
                    !item.isActive && styles.inactiveButtonText
                  ]}
                >
                  {item.isActive ? 'ADD' : 'Unavailable'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CategorySection;