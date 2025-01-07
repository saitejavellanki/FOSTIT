// types.ts
export interface ShopDetails {
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
    vendorId: string;
  }
  
  export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    isActive: boolean;
    dietType: 'veg' | 'non-veg';
    shopId: string;
    vendorId: string;
  }
  
  export interface CartItem extends MenuItem {
    quantity: number;
    shopName?: string;
  }
  
  export interface CategorySectionProps {
    title: string;
    items: MenuItem[];
    onItemPress: (item: MenuItem) => void;
    addToCart: (item: MenuItem) => void;
  }
  