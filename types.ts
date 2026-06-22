export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  country: string;
  address: string;
  propertyType: 'Apartment' | 'House' | 'Studio';
  imageUrls: string[];
  ownerId: string;
  createdAt: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAvatarUrl?: string | null;
  ownerEmail?: string;
}

export interface FilterParams {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  propertyType: 'All' | 'Apartment' | 'House' | 'Studio';
}
