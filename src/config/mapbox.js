export const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export const MAP_STYLES = {
  // Standard Mapbox styles
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
  SATELLITE_STREETS: 'mapbox://styles/mapbox/satellite-streets-v12',

  // You can create custom styles at https://studio.mapbox.com/
  CUSTOM_CAMPUS: 'mapbox://styles/yourusername/your-style-id',
};

// Campus locations
export const CAMPUS_LOCATIONS = {
  MAIN_GATE: {
    id: 'main_gate',
    name: 'Main Gate',
    fullName: 'Main Gate, Babcock University',
    coordinates: [3.719778, 6.888898],
    address: 'University Entrance',
    type: 'pickup',
  },
  PIONEER_CHURCH: {
    id: 'pioneer_church',
    name: 'Pioneer Church',
    fullName: 'Pioneer Church, Babcock University',
    coordinates: [3.719884, 6.889225],
    address: 'University Entrance',
    type: 'pickup',
  },
  YOUTH_CHAPEL: {
    id: 'youth_chapel',
    name: 'Youth Chapel',
    fullName: 'Youth Chapel, Babcock University',
    coordinates: [3.719602, 6.890002],
    address: 'Youth Chapel, Babcock University',
    type: 'pickup',
  },
  ANDREWS_PARK: {
    id: 'andrews_park',
    name: 'Andrews Park',
    fullName: 'Andrews Park, Babcock University',
    coordinates: [3.721142, 6.888846],
    address: 'Andrews Park, Babcock University',
    type: 'pickup',
  },
  BABCOCK_GUEST_HOUSE: {
    id: 'babcock_guest_house',
    name: 'BGH',
    fullName: 'Babcock University Guest House',
    coordinates: [3.719866, 6.890042],
    address: 'Guest House, Babcock University',
    type: 'hospitality',
  },
  SENATE_BUILDING: {
    id: 'senate_building',
    name: 'Senate Building',
    fullName: 'Senate Building, Babcock University',
    otherNames: ['Senate', 'Administration Building', 'Registry'],
    coordinates: [3.72141, 6.888939],
    address: 'Senate Building, Babcock University',
    type: 'administration',
  },
  SCIENCE_AND_TECHNOLOGY1: {
    id: 'science_and_technology_1',
    name: 'SAT1',
    fullName: 'Science and Technology Building, Car Park 1, Babcock University',
    otherNames: ['Science and Technology', 'SAT Building', 'Book Shop'],
    coordinates: [3.721631, 6.888266],
    address: 'Science and Technology Building, Babcock University',
    type: 'academic',
  },
  SCIENCE_AND_TECHNOLOGY2: {
    id: 'science_and_technology_2',
    name: 'SAT2',
    fullName: 'Science and Technology Building, Car Park 2, Babcock University',
    otherNames: ['Science and Technology', 'SAT Building'],
    coordinates: [3.723189, 6.887949],
    address: 'Science and Technology Building, Babcock University',
    type: 'academic',
  },
  BIG_HALL: {
    id: 'big_hall',
    name: 'Big Hall',
    fullName: 'Big Hall, Babcock University',
    otherNames: ['Big Hall'],
    coordinates: [3.723621, 6.88507],
    address: 'BIG Hall, Babcock University',
    type: 'hostel',
  },
  UNIVERSITY_STORE: {
    id: 'university_store',
    name: 'University Store',
    fullName: 'University Store, Babcock University',
    otherNames: ['University Store', 'Book Shop'],
    coordinates: [3.724138, 6.890023],
    address: 'University Store, Babcock University',
    type: 'admin',
  },
  NUDT_LAB: {
    id: 'nudt_lab',
    name: 'NUDT Lab',
    fullName: 'NUDT Lab, Babcock University',
    otherNames: ['NUDT Lab'],
    coordinates: [3.725456, 6.890665],
    address: 'NUDT Lab, Babcock University',
    type: 'academic',
  },
  ENTREPRENEURSHIP_CENTER: {
    id: 'babcock_business_center',
    name: 'Entrepreneurship Center',
    fullName: 'Entrepreneurship Center, Babcock University',
    otherNames: ['Entrepreneurship Center', 'E-Center', 'Vocational Center'],
    coordinates: [3.726222, 6.889538],
    address: 'Entrepreneurship Center, Babcock University',
    type: 'vocational',
  },
  BABCOCK_BUSINESS_SCHOOL: {
    id: 'babcock_business_school',
    name: 'Babcock Business School',
    fullName: 'Babcock Business School, Babcock University',
    otherNames: ['Business School', 'BBS', 'school of postgraduate studies'],
    coordinates: [3.723832, 6.890848],
    address: 'Babcock Business School, Babcock University',
    type: 'academic',
  },
  SAPPHIRE_HALL: {
    id: 'sapphire_hall',
    name: 'Sapphire Hall',
    fullName: 'Sapphire Hall, Babcock University',
    otherNames: ['Sapphire Hall', 'Sapphire'],
    coordinates: [3.726401, 6.891605],
    address: 'Sapphire Hall, Babcock University',
    type: 'hostel',
  },
  DIAMOND_HALL: {
    id: 'diamond_hall',
    name: 'Diamond Hall',
    fullName: 'Diamond Hall, Babcock University',
    otherNames: ['Diamond Hall', 'Diamond'],
    coordinates: [3.726849, 6.891813],
    address: 'Diamond Hall, Babcock University',
    type: 'hostel',
  },
  PLATINUM_HALL: {
    id: 'platinum_hall',
    name: 'Platinum Hall',
    fullName: 'Platinum Hall, Babcock University',
    otherNames: ['Platinum Hall', 'Platinum'],
    coordinates: [3.727057, 6.892249],
    address: 'Platinum Hall, Babcock University',
    type: 'hostel',
  },
  CRYSTAL_HALL: {
    id: 'crystal_hall',
    name: 'Crystal Hall',
    fullName: 'Crystal Hall, Babcock University',
    otherNames: ['Crystal Hall', 'Crystal'],
    coordinates: [3.727576, 6.892974],
    address: 'Crystal Hall, Babcock University',
    type: 'hostel',
  },
  STADIUM1: {
    id: 'stadium1',
    name: 'Stadium First Gate',
    fullName: 'Babcock University Stadium, First Gate',
    coordinates: [3.726942, 6.894318],
    address: 'Babcock University Stadium',
    type: 'recreation',
  },
  STADIUM2: {
    id: 'stadium2',
    name: 'Stadium Second Gate',
    fullName: 'Babcock University Stadium, Second Gate',
    coordinates: [3.727075, 6.895343],
    address: 'Babcock University Stadium',
    type: 'recreation',
  },
  HAVILAH_HALL: {
    id: 'havilah_hall',
    name: 'Havilah Hall',
    fullName: 'Havilah Hall, Babcock University',
    coordinates: [3.726048, 6.894644],
    address: 'Havilah Hall, Babcock University',
    type: 'hostel',
  },
  FELICIA_ADEBISI_DADA_HALL: {
    id: 'felicia_adebisi_dada_hall',
    name: 'FAD Hall',
    fullName: 'Felicia Adebisi Dada Hall, Babcock University',
    coordinates: [3.725099, 6.89349],
    address: 'FAD Hall, Babcock University',
    type: 'hostel',
  },
  QUEEN_ESTHER_HALL: {
    id: 'queen_esther_hall',
    name: 'Queen Esther Hall',
    fullName: 'Queen Esther Hall, Babcock University',
    coordinates: [3.724716, 6.892993],
    address: 'Queen Esther Hall, Babcock University',
    type: 'hostel',
  },
  SCHOOL_CAFETERIA_ENTRANCE: {
    id: 'school_cafeteria_entrance',
    name: 'School Cafeteria Entrance',
    fullName: 'School Cafeteria Entrance, Babcock University',
    otherNames: [
      'School Cafeteria Entrance',
      'Cafeteria Entrance',
      'Caf entrance',
    ],
    coordinates: [3.723818, 6.892685],
    address: 'School Cafeteria, Babcock University',
    type: 'food',
  },
  SCHOOL_CAFETERIA_EXIT: {
    id: 'school_cafeteria_exit',
    name: 'School Cafeteria Exit',
    fullName: 'School Cafeteria Exit, Babcock University',
    otherNames: ['School Cafeteria Exit', 'Cafeteria Exit', 'Caf exit'],
    coordinates: [3.723685, 6.893234],
    address: 'School Cafeteria, Babcock University',
    type: 'food',
  },
  BUSA_HOUSE: {
    id: 'busa_house',
    name: 'BUSA House',
    fullName: 'BUSA House, Babcock University',
    otherNames: ['BUSA House', 'BUSA'],
    coordinates: [3.723783, 6.892007],
    address: 'BUSA House, Babcock University',
    type: 'administration',
  },
  BUCODEL: {
    id: 'bucodel',
    name: 'BuCodel',
    fullName: 'BuCodel, Babcock University',
    coordinates: [3.722969, 6.891722],
    address: 'VP09+VPP, Ilishan 121103, Ogun',
    type: 'pickup',
  },
  TOPAZ_HALL: {
    id: 'topaz_hall',
    name: 'Topaz Hall',
    fullName: 'Topaz Hall, Babcock University',
    coordinates: [3.720274, 6.89337],
    address: 'Topaz Hall, Babcock University',
    type: 'hostel',
  },
  // end of female side, gate, bgh, senate, science and tech, big hall, university store, nudt lab, entrepreneurship center, business school, sapphire hall, diamond hall, platinum hall, crystal hall, stadium gates, havilah hall, fad hall, queen esther hall, school cafeteria entrances/exits, busa house, bucdel, topaz
  EMERALD_HALL: {
    id: 'emerald_hall',
    name: 'Emerald Hall',
    fullName: 'Emerald Hall, Babcock University',
    coordinates: [3.7221, 6.8935],
    address: 'Babcock University Campus',
    type: 'hostel',
  },
  CHAPEL: {
    id: 'chapel',
    name: 'University Chapel',
    fullName: 'Babcock University Chapel',
    coordinates: [3.7205, 6.8915],
    address: 'Campus Chapel',
    type: 'landmark',
  },
  LIBRARY: {
    id: 'library',
    name: 'University Library',
    fullName: 'Babcock University Library',
    coordinates: [3.7215, 6.892],
    address: 'Main Library Building',
    type: 'landmark',
  },
  MEDICAL_CENTER: {
    id: 'medical_center',
    name: 'Medical Center',
    fullName: 'Babcock Medical Center',
    coordinates: [3.7195, 6.8905],
    address: 'Campus Health Center',
    type: 'service',
  },
};

// Get all locations as array
export const getAllLocations = () => {
  return Object.values(CAMPUS_LOCATIONS);
};

// Search locations by name
export const searchLocations = (query) => {
  if (!query) return getAllLocations();

  const lowerQuery = query.toLowerCase();
  return getAllLocations().filter(
    (location) =>
      location.name.toLowerCase().includes(lowerQuery) ||
      location.fullName.toLowerCase().includes(lowerQuery) ||
      location.address.toLowerCase().includes(lowerQuery),
  );
};

export const CAMPUS_CENTER = {
  longitude: 3.72,
  latitude: 6.89,
};
