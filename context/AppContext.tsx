import React, { createContext, useContext, useState, useEffect } from 'react';

// Types pour l'application
export interface Hike {
  id: string;
  name: string;
  location: string;
  duration: string;
  distance: number; // km
  elevation: number; // m
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Sportif';
  activity: 'Randonnée' | 'VTT' | 'Trail' | 'Raquettes';
  rating: number;
  reviewsCount: number;
  transportDuration: string; // ex: "1h15"
  description: string;
  image: string;
  weatherTemp: number;
  weatherIcon: 'sunny' | 'cloudy' | 'rainy';
  gpxPath: string; // SVG path
  departureStation: string;
  nearbyStation: string;
  trainPrice: number; // Prix de base sans pass (EUR)
  includedInPasses: string[]; // ex: ['Navigo', 'TER AURA']
  co2Saved: number; // kg de CO2 par rapport à la voiture
  coordinates: { x: number; y: number }; // Pour la carte interactive SVG
}

export interface TransitPass {
  id: string;
  name: string;
  region: string;
  description: string;
  priceInfo: string;
}

export interface PlannedTrip {
  id: string;
  hikeId: string;
  hikeName: string;
  date: string;
  departureStation: string;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  pricePaid: number;
  co2Saved: number;
  status: 'Prêt au départ' | 'En attente billet' | 'Terminée';
}

export interface SearchFilters {
  place: string;
  difficulty: string[];
  maxTransportTime: number; // minutes
  maxElevation: number; // meters
  maxDistance: number; // km
  activities: string[];
  accessibility: string[];
  minRating: number;
}

interface AppContextType {
  hikes: Hike[];
  transitPasses: TransitPass[];
  userPasses: string[]; // IDs de pass détenus par l'utilisateur
  onboardingCompleted: boolean;
  favorites: string[]; // IDs de randonnées
  plannedAdventures: PlannedTrip[];
  filters: SearchFilters;
  toggleFavorite: (hikeId: string) => void;
  setUserPasses: (passes: string[]) => void;
  setOnboardingCompleted: (val: boolean) => void;
  setFilters: (filters: SearchFilters) => void;
  addAdventure: (trip: Omit<PlannedTrip, 'id'>) => void;
  resetOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Utilitaire pour calculer le prix et l'économie du trajet selon les pass
export function getHikePriceInfo(hike: Hike, userPasses: string[]) {
  let isFree = false;
  let hasDiscount = false;
  let finalPrice = hike.trainPrice;
  let passUsedName = '';

  // 1. Vérifier la gratuité complète (Navigo, TER AURA, Pass Rail)
  if (userPasses.includes('navigo') && hike.includedInPasses.includes('navigo')) {
    isFree = true;
    finalPrice = 0;
    passUsedName = 'Pass Navigo';
  } else if (userPasses.includes('ter-aura') && hike.includedInPasses.includes('ter-aura')) {
    isFree = true;
    finalPrice = 0;
    passUsedName = 'TER AURA';
  } else if (userPasses.includes('pass-rail') && hike.includedInPasses.includes('pass-rail') && !hike.includedInPasses.includes('navigo')) {
    isFree = true;
    finalPrice = 0;
    passUsedName = 'Pass Rail';
  }

  // 2. Si non gratuit, vérifier les réductions
  if (!isFree) {
    if (userPasses.includes('avantage-jeune') && hike.includedInPasses.includes('avantage-jeune')) {
      finalPrice = parseFloat((hike.trainPrice * 0.7).toFixed(2)); // 30% de réduc
      hasDiscount = true;
      passUsedName = 'Carte Avantage';
    } else if (userPasses.includes('max-jeune') && hike.includedInPasses.includes('max-jeune')) {
      finalPrice = 0; // TGV Max
      isFree = true;
      passUsedName = 'TGV MAX';
    }
  }

  const savings = parseFloat((hike.trainPrice - finalPrice).toFixed(2));

  return {
    price: finalPrice,
    isFree,
    hasDiscount,
    savings,
    passUsedName,
    displayText: isFree ? 'Gratuit' : `${finalPrice.toFixed(2)}€`,
    badgeText: isFree ? `Inclus • ${passUsedName}` : hasDiscount ? `-30% • ${passUsedName}` : null
  };
}

// Données de randonnées de haute fidélité
const STATIC_HIKES: Hike[] = [
  {
    id: '1',
    name: 'Circuit des 25 Bosses',
    location: 'Forêt de Fontainebleau',
    duration: '5h30',
    distance: 16,
    elevation: 480,
    difficulty: 'Difficile',
    activity: 'Randonnée',
    rating: 4.8,
    reviewsCount: 142,
    transportDuration: '1h10',
    description: 'Une randonnée sportive mythique à l\'orée de Paris. Le sentier serpente entre rochers de grès, landes de sable blanc et pins. Parfait pour s\'entraîner avant la montagne.',
    image: 'https://images.unsplash.com/photo-1551632811-561730d1e4de?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 21,
    weatherIcon: 'sunny',
    gpxPath: 'M 10,80 Q 30,20 50,75 T 90,40 T 130,90 T 170,30 T 210,85 T 250,50 T 290,10',
    departureStation: 'Paris Gare de Lyon',
    nearbyStation: 'Maisse (RER D)',
    trainPrice: 5.00,
    includedInPasses: ['navigo'],
    co2Saved: 12.4,
    coordinates: { x: 140, y: 350 },
  },
  {
    id: '2',
    name: 'Balcon des Moucherolles',
    location: 'Massif du Vercors',
    duration: '4h00',
    distance: 11,
    elevation: 750,
    difficulty: 'Moyen',
    activity: 'Randonnée',
    rating: 4.6,
    reviewsCount: 88,
    transportDuration: '1h35',
    description: 'Offrant un panorama grandiose sur la chaîne alpine et le Mont Blanc, cette boucle grimpe sur la crête du Vercors. Accessible en bus depuis la gare de Grenoble.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 16,
    weatherIcon: 'cloudy',
    gpxPath: 'M 10,90 C 50,70 80,10 120,40 C 160,70 200,95 240,50 C 260,30 280,70 290,90',
    departureStation: 'Grenoble Gare',
    nearbyStation: 'Villard-de-Lans (Bus T64)',
    trainPrice: 14.80,
    includedInPasses: ['ter-aura', 'pass-rail'],
    co2Saved: 28.5,
    coordinates: { x: 210, y: 190 },
  },
  {
    id: '3',
    name: 'Le Grand Som',
    location: 'Massif de la Chartreuse',
    duration: '6h00',
    distance: 14,
    elevation: 1100,
    difficulty: 'Sportif',
    activity: 'Randonnée',
    rating: 4.9,
    reviewsCount: 57,
    transportDuration: '1h15',
    description: 'Une ascension exigeante et sauvage vers l\'un des sommets phares de la Chartreuse. Vous traverserez des vires aériennes avec des câbles et une vue plongeante sur le Monastère de la Grande Chartreuse.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 14,
    weatherIcon: 'sunny',
    gpxPath: 'M 10,95 L 80,75 L 140,25 L 170,10 L 200,45 L 240,80 L 290,95',
    departureStation: 'Grenoble Gare',
    nearbyStation: 'St-Pierre-de-Chartreuse (Bus T83)',
    trainPrice: 12.20,
    includedInPasses: ['ter-aura', 'pass-rail'],
    co2Saved: 32.1,
    coordinates: { x: 260, y: 220 },
  },
  {
    id: '4',
    name: 'Sentier de l\'Érosion',
    location: 'Forêt de Fontainebleau',
    duration: '2h00',
    distance: 6.5,
    elevation: 120,
    difficulty: 'Facile',
    activity: 'Randonnée',
    rating: 4.3,
    reviewsCount: 39,
    transportDuration: '0h45',
    description: 'Une balade idéale en famille à travers les magnifiques pinèdes et chaos sableux de Bois-le-Roi. Le sentier est bien balisé et permet d\'observer l\'érosion naturelle du grès.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 22,
    weatherIcon: 'sunny',
    gpxPath: 'M 10,70 Q 60,85 100,60 T 180,55 T 250,75 T 290,70',
    departureStation: 'Paris Gare de Lyon',
    nearbyStation: 'Bois-le-Roi (Transilien R)',
    trainPrice: 5.00,
    includedInPasses: ['navigo'],
    co2Saved: 9.8,
    coordinates: { x: 110, y: 310 },
  },
  {
    id: '5',
    name: 'Crête du Mont Veyrier',
    location: 'Lac d\'Annecy',
    duration: '3h30',
    distance: 9.5,
    elevation: 680,
    difficulty: 'Moyen',
    activity: 'Trail',
    rating: 4.7,
    reviewsCount: 184,
    transportDuration: '1h20',
    description: 'Courir ou marcher sur les crêtes suspendues au-dessus des eaux turquoise du Lac d\'Annecy. Le sentier offre des points de vue plongeants exceptionnels tout au long de la crête forestière.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 18,
    weatherIcon: 'sunny',
    gpxPath: 'M 10,80 Q 70,30 130,55 T 200,40 T 290,80',
    departureStation: 'Annecy Gare',
    nearbyStation: 'Veyrier-du-Lac (Bus 60)',
    trainPrice: 8.50,
    includedInPasses: ['ter-aura', 'pass-rail'],
    co2Saved: 19.2,
    coordinates: { x: 190, y: 130 },
  },
  {
    id: '6',
    name: 'Le Balcon du Lac Blanc',
    location: 'Vallée de Chamonix',
    duration: '4h30',
    distance: 8,
    elevation: 500,
    difficulty: 'Moyen',
    activity: 'Randonnée',
    rating: 4.9,
    reviewsCount: 312,
    transportDuration: '2h15',
    description: 'Une randonnée alpine face au massif du Mont-Blanc. Le Lac Blanc, souvent enneigé, reflète les aiguilles de Chamonix. Une liaison train + télécabine idéale sans voiture.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop',
    weatherTemp: 12,
    weatherIcon: 'cloudy',
    gpxPath: 'M 10,90 L 90,60 L 150,30 L 190,15 L 230,50 L 290,90',
    departureStation: 'Chamonix Gare',
    nearbyStation: 'La Flégère (Train Express)',
    trainPrice: 22.00,
    includedInPasses: ['ter-aura', 'pass-rail', 'avantage-jeune'],
    co2Saved: 34.7,
    coordinates: { x: 230, y: 80 },
  }
];

// Liste des abonnements/pass gérés
const TRANSIT_PASSES: TransitPass[] = [
  {
    id: 'navigo',
    name: 'Pass Navigo Annuel / Mensuel',
    region: 'Île-de-France',
    description: 'Donne accès en illimité au métro, RER, bus et trains de banlieue Transilien dans toute la région IDF.',
    priceInfo: 'Voyages 100% gratuits sur Fontainebleau et l\'IDF.'
  },
  {
    id: 'ter-aura',
    name: 'Abonnement TER Auvergne-Rhône-Alpes (Oùra)',
    region: 'Auvergne-Rhône-Alpes',
    description: 'Permet de voyager en TER et bus régionaux en illimité sur les lignes choisies d\'Auvergne-Rhône-Alpes.',
    priceInfo: 'Voyages 100% gratuits ou réductions fortes en AURA.'
  },
  {
    id: 'pass-rail',
    name: 'Pass Rail Jeune',
    region: 'National',
    description: 'Destiné aux moins de 27 ans. Voyagez en illimité sur tous les TER et Intercités en France pour 49€/mois.',
    priceInfo: 'Tous les trajets TER en France à 0€ (hors IDF).'
  },
  {
    id: 'avantage-jeune',
    name: 'Carte Avantage Jeune (SNCF)',
    region: 'National',
    description: '30% de réduction garantie sur tous les TGV INOUI et Intercités, avec prix plafonnés.',
    priceInfo: '30% de réduction sur les liaisons longue distance.'
  },
  {
    id: 'max-jeune',
    name: 'Abonnement TGV MAX JEUNE',
    region: 'National',
    description: 'Pour 79€/mois, voyages à 0€ sur les TGV et Intercités à réservation obligatoire pour les jeunes.',
    priceInfo: 'TGV à 0€ sur réservation.'
  }
];

const DEFAULT_FILTERS: SearchFilters = {
  place: '',
  difficulty: [],
  maxTransportTime: 180,
  maxElevation: 2000,
  maxDistance: 30,
  activities: [],
  accessibility: [],
  minRating: 0,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPasses, setUserPassesState] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [plannedAdventures, setPlannedAdventures] = useState<PlannedTrip[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  // Charger les états depuis le stockage au démarrage si nécessaire (ici mocké en mémoire)
  useEffect(() => {
    // Simuler le chargement
  }, []);

  const toggleFavorite = (hikeId: string) => {
    setFavorites((prev) =>
      prev.includes(hikeId) ? prev.filter((id) => id !== hikeId) : [...prev, hikeId]
    );
  };

  const setUserPasses = (passes: string[]) => {
    setUserPassesState(passes);
  };

  const addAdventure = (trip: Omit<PlannedTrip, 'id'>) => {
    const newTrip: PlannedTrip = {
      ...trip,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPlannedAdventures((prev) => [newTrip, ...prev]);
  };

  const resetOnboarding = () => {
    setOnboardingCompleted(false);
    setUserPassesState([]);
  };

  return (
    <AppContext.Provider
      value={{
        hikes: STATIC_HIKES,
        transitPasses: TRANSIT_PASSES,
        userPasses,
        onboardingCompleted,
        favorites,
        plannedAdventures,
        filters,
        toggleFavorite,
        setUserPasses,
        setOnboardingCompleted,
        setFilters,
        addAdventure,
        resetOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
