import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  dietType: 'veg' | 'non-veg';
  isActive: boolean;
  price: number;
  imageUrl: string;
  shopId: string;
  vendorId: string;
}

interface ShopHeaderProps {
  items: MenuItem[];
  onSearchResults: (results: MenuItem[]) => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ items, onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const router = useRouter();

  const filterOptions = [
    { id: 'all', label: 'All', value: 'all', color: '#FF9800' },
    { id: 'veg', label: 'Veg Only', value: 'veg', color: '#4CAF50' },
    { id: 'non-veg', label: 'Non-Veg', value: 'non-veg', color: '#F44336' },
    { id: 'available', label: 'Available', value: 'available', color: '#FF9800' },
  ];

  const applyFiltersAndSearch = (query: string, filters: string[]) => {
    let filteredResults = [...items];

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredResults = filteredResults.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters if not "all"
    if (!filters.includes('all')) {
      filteredResults = filteredResults.filter(item => {
        const dietTypeMatch = filters.includes(item.dietType);
        const availabilityMatch = filters.includes('available') ? item.isActive : true;
        
        // If both diet type and availability filters are present
        if (filters.includes('available') && (filters.includes('veg') || filters.includes('non-veg'))) {
          return dietTypeMatch && availabilityMatch;
        }
        
        // If only diet type or availability filter is present
        return dietTypeMatch || availabilityMatch;
      });
    }

    onSearchResults(filteredResults);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(query, activeFilters);
  };

  const handleFilterPress = (filter: string) => {
    let newFilters: string[];

    if (filter === 'all') {
      newFilters = ['all'];
    } else {
      const currentFilters = activeFilters.filter(f => f !== 'all');
      
      if (currentFilters.includes(filter)) {
        // Remove the filter
        newFilters = currentFilters.filter(f => f !== filter);
        // If no filters left, set to 'all'
        if (newFilters.length === 0) {
          newFilters = ['all'];
        }
      } else {
        // Add the filter
        newFilters = [...currentFilters, filter];
      }
    }

    setActiveFilters(newFilters);
    applyFiltersAndSearch(searchQuery, newFilters);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons 
              name="search-outline" 
              size={20} 
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#666"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters Section */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterPress(filter.value)}
              style={[
                styles.filterButton,
                activeFilters.includes(filter.value) && {
                  backgroundColor: filter.color,
                  borderColor: filter.color,
                }
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilters.includes(filter.value) && styles.filterTextActive
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
});

export default ShopHeader;