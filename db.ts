import fs from 'fs';
import path from 'path';

// Types for DB Collections
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
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
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// Helper to ensure data directory and files exist
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  if (!fs.existsSync(PROPERTIES_FILE)) {
    // Seed some beautiful starting properties for an incredible out-of-the-box appearance
    const seedProperties: Property[] = [
      {
        id: 'prop-1',
        title: 'Luxurious Penthouse in Downtown Manhattan',
        description: 'Spectacular 3-bedroom penthouse with panoramic city views, private rooftop terrace, floor-to-ceiling windows, high-end European appliances, and marble chef kitchen. Excellent location steps from fine dining, boutique shopping, and major high-profile amenities.',
        price: 8500,
        city: 'New York',
        country: 'USA',
        address: '742 Broadway Est, Penthouse B',
        propertyType: 'Apartment',
        imageUrls: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-1',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-2',
        title: 'Elegant Modern Villa in Bastos',
        description: 'Stunning 4-bedroom executive villa located in the highly prestigious and secure Bastos diplomatic neighborhood. Features a private landscaped garden, extensive multi-vehicle parking garage, premium split air conditioning systems, solar backup energy, and an elegant high bar kitchen. Absolute luxury living in the capital.',
        price: 2400000,
        city: 'Yaoundé',
        country: 'Cameroon',
        address: 'Rue de Bastos, near Embassies',
        propertyType: 'House',
        imageUrls: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-3',
        title: 'Charming Minimalist Studio in Shibuya',
        description: 'Compact, ultra-modern and space-efficient studio apartment located in the heart of Shibuya. Features integrated smart home controls, space-saving hidden bed, high-speed fiber internet, and a sleek contemporary Japanese aesthetic. Ideal for young professionals or digital nomads.',
        price: 198000,
        city: 'Tokyo',
        country: 'Japan',
        address: '2-Chome Dogenzaka',
        propertyType: 'Studio',
        imageUrls: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-2',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-4',
        title: 'Sleek Contemporary Apartment in Bonapriso',
        description: 'Exquisite 2-bedroom fully air-conditioned luxury apartment in the sought-after upscale residential district of Bonapriso. Boasts Italian marble finishing, fully equipped kitchen with integrated microwave and oven, a wide sunlit terrace, gym facility, and 24/7 security concierge with stand-by generator.',
        price: 850000,
        city: 'Douala',
        country: 'Cameroon',
        address: 'Rue de Bonapriso',
        propertyType: 'Apartment',
        imageUrls: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-5',
        title: 'Mid-Century Modern Villa with Private Pool',
        description: 'Beautiful architecturally preserved 4-bedroom estate featuring mid-century design. Boasts an expansive open floor plan, heated salt-water swimming pool, professionally landscaped tropical gardens, and a state-of-the-art security system. Perfectly situated in a quiet residential area.',
        price: 12000,
        city: 'Los Angeles',
        country: 'USA',
        address: '1428 Elm Dr, Beverly Hills',
        propertyType: 'House',
        imageUrls: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-1',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-6',
        title: 'Aesthetic Garden Flat near Eiffel Tower',
        description: 'Charming 1-bedroom flat with high ceilings and private ivy terrace situated in a quiet cobblestone courtyard. Steps from the Champs de Mars and the Eiffel Tower. Fully furnished, stylish vintage Parisian elements blended with modern shower amenities.',
        price: 2800,
        city: 'Paris',
        country: 'France',
        address: '12 Rue de l\'Université',
        propertyType: 'Apartment',
        imageUrls: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-3',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prop-7',
        title: 'Cozy Loft Apartment in Shoreditch',
        description: 'Stunning converted warehouse loft retaining original exposed brickwork, timber beams, and double-height industrial crittall windows. Fully furnished with industrial-chic pieces, high-end bathroom suite, and custom oak workspace. Moments from Shoreditch High Street Station.',
        price: 3200,
        city: 'London',
        country: 'UK',
        address: '42 Boundary St, Loft 5',
        propertyType: 'Apartment',
        imageUrls: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
        ],
        ownerId: 'seed-owner-3',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(seedProperties, null, 2), 'utf8');
  }
}

// Memory caching to avoid excessive disk operations in single event-loops
let cachedUsers: User[] | null = null;
let cachedProperties: Property[] | null = null;

export const db = {
  getUsers(): User[] {
    ensureDb();
    if (cachedUsers) return cachedUsers;
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    cachedUsers = JSON.parse(data);
    return cachedUsers || [];
  },

  saveUsers(users: User[]) {
    ensureDb();
    cachedUsers = users;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  },

  getProperties(): Property[] {
    ensureDb();
    if (cachedProperties) return cachedProperties;
    const data = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    cachedProperties = JSON.parse(data);
    return cachedProperties || [];
  },

  saveProperties(properties: Property[]) {
    ensureDb();
    cachedProperties = properties;
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf8');
  }
};
