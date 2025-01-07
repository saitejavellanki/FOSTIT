// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    shopHeader: {
      width: '100%',
      height: 200,
    },
    shopImage: {
      width: '100%',
      height: '100%',
    },
    shopInfo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    shopDescription: {
      color: '#fff',
      marginTop: 8,
    },
    categorySection: {
      padding: 16,
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    menuItem: {
      marginBottom: 16,
      borderRadius: 8,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    inactiveItem: {
      opacity: 0.5,
    },
    menuItemContent: {
      flexDirection: 'row',
      padding: 12,
    },
    menuItemImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    menuItemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    menuItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    menuItemDescription: {
      color: '#666',
      fontSize: 14,
      marginTop: 4,
    },
    menuItemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#48c479',
    },
    inactivePrice: {
      textDecorationLine: 'line-through',
      color: '#666',
    },
    addButton: {
      backgroundColor: '#fc8019',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
    },
    inactiveButton: {
      backgroundColor: '#ccc',
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    dietTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginLeft: 8,
    },
    dietTypeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    modalClose: {
      position: 'absolute',
      right: 16,
      top: 16,
      zIndex: 1,
    },
    modalImage: {
      width: '100%',
      height: 250,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalInfo: {
      padding: 16,
    },
    modalDescription: {
      marginTop: 8,
      color: '#666',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    modalPrice: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#48c479',
    },
    modalAddButton: {
      backgroundColor: '#fc8019',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    cartButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: '#fc8019',
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1,
    },
    badge: {
      position: 'absolute',
      right: -6,
      top: -6,
      backgroundColor: '#ff4d4d',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    }
  });