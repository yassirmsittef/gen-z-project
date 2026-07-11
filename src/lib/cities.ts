/**
 * Villes proposées pour la localisation des membres (globe Communauté).
 *
 * La position d'un membre est TOUJOURS celle de sa ville (jamais une position
 * précise) : c'est un choix déclaratif, modifiable et optionnel.
 * Coordonnées au centième de degré — largement suffisant à l'échelle du globe.
 */

export type City = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export const CITIES: readonly City[] = [
  // --- France métropolitaine ---
  { name: "Paris", country: "France", lat: 48.86, lng: 2.35 },
  { name: "Marseille", country: "France", lat: 43.3, lng: 5.37 },
  { name: "Lyon", country: "France", lat: 45.76, lng: 4.84 },
  { name: "Toulouse", country: "France", lat: 43.6, lng: 1.44 },
  { name: "Nice", country: "France", lat: 43.7, lng: 7.27 },
  { name: "Nantes", country: "France", lat: 47.22, lng: -1.55 },
  { name: "Montpellier", country: "France", lat: 43.61, lng: 3.88 },
  { name: "Strasbourg", country: "France", lat: 48.57, lng: 7.75 },
  { name: "Bordeaux", country: "France", lat: 44.84, lng: -0.58 },
  { name: "Lille", country: "France", lat: 50.63, lng: 3.07 },
  { name: "Rennes", country: "France", lat: 48.11, lng: -1.68 },
  { name: "Reims", country: "France", lat: 49.26, lng: 4.03 },
  { name: "Toulon", country: "France", lat: 43.12, lng: 5.93 },
  { name: "Saint-Étienne", country: "France", lat: 45.44, lng: 4.39 },
  { name: "Le Havre", country: "France", lat: 49.49, lng: 0.11 },
  { name: "Grenoble", country: "France", lat: 45.19, lng: 5.72 },
  { name: "Dijon", country: "France", lat: 47.32, lng: 5.04 },
  { name: "Angers", country: "France", lat: 47.47, lng: -0.55 },
  { name: "Nîmes", country: "France", lat: 43.84, lng: 4.36 },
  { name: "Clermont-Ferrand", country: "France", lat: 45.78, lng: 3.08 },
  { name: "Tours", country: "France", lat: 47.39, lng: 0.69 },
  { name: "Limoges", country: "France", lat: 45.83, lng: 1.26 },
  { name: "Amiens", country: "France", lat: 49.89, lng: 2.3 },
  { name: "Annecy", country: "France", lat: 45.9, lng: 6.13 },
  { name: "Perpignan", country: "France", lat: 42.7, lng: 2.9 },
  { name: "Besançon", country: "France", lat: 47.24, lng: 6.02 },
  { name: "Metz", country: "France", lat: 49.12, lng: 6.18 },
  { name: "Orléans", country: "France", lat: 47.9, lng: 1.9 },
  { name: "Rouen", country: "France", lat: 49.44, lng: 1.1 },
  { name: "Mulhouse", country: "France", lat: 47.75, lng: 7.34 },
  { name: "Caen", country: "France", lat: 49.18, lng: -0.37 },
  { name: "Nancy", country: "France", lat: 48.69, lng: 6.18 },
  { name: "Avignon", country: "France", lat: 43.95, lng: 4.81 },
  { name: "La Rochelle", country: "France", lat: 46.16, lng: -1.15 },
  { name: "Brest", country: "France", lat: 48.39, lng: -4.49 },
  { name: "Pau", country: "France", lat: 43.3, lng: -0.37 },
  { name: "Bayonne", country: "France", lat: 43.49, lng: -1.48 },
  { name: "Le Mans", country: "France", lat: 48.01, lng: 0.2 },
  { name: "Ajaccio", country: "France", lat: 41.92, lng: 8.74 },
  // --- Outre-mer ---
  { name: "Fort-de-France", country: "Martinique", lat: 14.61, lng: -61.07 },
  { name: "Pointe-à-Pitre", country: "Guadeloupe", lat: 16.24, lng: -61.53 },
  { name: "Saint-Denis (La Réunion)", country: "La Réunion", lat: -20.88, lng: 55.45 },
  { name: "Cayenne", country: "Guyane", lat: 4.94, lng: -52.33 },
  { name: "Nouméa", country: "Nouvelle-Calédonie", lat: -22.28, lng: 166.46 },
  { name: "Papeete", country: "Polynésie française", lat: -17.53, lng: -149.57 },
  // --- Europe ---
  { name: "Bruxelles", country: "Belgique", lat: 50.85, lng: 4.35 },
  { name: "Liège", country: "Belgique", lat: 50.63, lng: 5.57 },
  { name: "Genève", country: "Suisse", lat: 46.2, lng: 6.15 },
  { name: "Lausanne", country: "Suisse", lat: 46.52, lng: 6.63 },
  { name: "Zurich", country: "Suisse", lat: 47.37, lng: 8.54 },
  { name: "Luxembourg", country: "Luxembourg", lat: 49.61, lng: 6.13 },
  { name: "Londres", country: "Royaume-Uni", lat: 51.51, lng: -0.13 },
  { name: "Manchester", country: "Royaume-Uni", lat: 53.48, lng: -2.24 },
  { name: "Dublin", country: "Irlande", lat: 53.35, lng: -6.26 },
  { name: "Amsterdam", country: "Pays-Bas", lat: 52.37, lng: 4.9 },
  { name: "Rotterdam", country: "Pays-Bas", lat: 51.92, lng: 4.48 },
  { name: "Berlin", country: "Allemagne", lat: 52.52, lng: 13.41 },
  { name: "Munich", country: "Allemagne", lat: 48.14, lng: 11.58 },
  { name: "Hambourg", country: "Allemagne", lat: 53.55, lng: 9.99 },
  { name: "Francfort", country: "Allemagne", lat: 50.11, lng: 8.68 },
  { name: "Cologne", country: "Allemagne", lat: 50.94, lng: 6.96 },
  { name: "Vienne", country: "Autriche", lat: 48.21, lng: 16.37 },
  { name: "Prague", country: "Tchéquie", lat: 50.08, lng: 14.44 },
  { name: "Varsovie", country: "Pologne", lat: 52.23, lng: 21.01 },
  { name: "Cracovie", country: "Pologne", lat: 50.06, lng: 19.94 },
  { name: "Budapest", country: "Hongrie", lat: 47.5, lng: 19.04 },
  { name: "Bucarest", country: "Roumanie", lat: 44.43, lng: 26.1 },
  { name: "Sofia", country: "Bulgarie", lat: 42.7, lng: 23.32 },
  { name: "Athènes", country: "Grèce", lat: 37.98, lng: 23.73 },
  { name: "Rome", country: "Italie", lat: 41.9, lng: 12.5 },
  { name: "Milan", country: "Italie", lat: 45.46, lng: 9.19 },
  { name: "Naples", country: "Italie", lat: 40.85, lng: 14.27 },
  { name: "Turin", country: "Italie", lat: 45.07, lng: 7.69 },
  { name: "Madrid", country: "Espagne", lat: 40.42, lng: -3.7 },
  { name: "Barcelone", country: "Espagne", lat: 41.39, lng: 2.17 },
  { name: "Valencia", country: "Espagne", lat: 39.47, lng: -0.38 },
  { name: "Séville", country: "Espagne", lat: 37.39, lng: -5.99 },
  { name: "Lisbonne", country: "Portugal", lat: 38.72, lng: -9.14 },
  { name: "Porto", country: "Portugal", lat: 41.15, lng: -8.61 },
  { name: "Copenhague", country: "Danemark", lat: 55.68, lng: 12.57 },
  { name: "Stockholm", country: "Suède", lat: 59.33, lng: 18.07 },
  { name: "Oslo", country: "Norvège", lat: 59.91, lng: 10.75 },
  { name: "Helsinki", country: "Finlande", lat: 60.17, lng: 24.94 },
  { name: "Kyiv", country: "Ukraine", lat: 50.45, lng: 30.52 },
  { name: "Istanbul", country: "Turquie", lat: 41.01, lng: 28.98 },
  { name: "Belgrade", country: "Serbie", lat: 44.79, lng: 20.45 },
  { name: "Zagreb", country: "Croatie", lat: 45.81, lng: 15.98 },
  // --- Maghreb & Afrique ---
  { name: "Casablanca", country: "Maroc", lat: 33.57, lng: -7.59 },
  { name: "Rabat", country: "Maroc", lat: 34.02, lng: -6.84 },
  { name: "Marrakech", country: "Maroc", lat: 31.63, lng: -8.01 },
  { name: "Tanger", country: "Maroc", lat: 35.76, lng: -5.83 },
  { name: "Fès", country: "Maroc", lat: 34.03, lng: -5.0 },
  { name: "Agadir", country: "Maroc", lat: 30.42, lng: -9.6 },
  { name: "Alger", country: "Algérie", lat: 36.75, lng: 3.06 },
  { name: "Oran", country: "Algérie", lat: 35.7, lng: -0.63 },
  { name: "Tunis", country: "Tunisie", lat: 36.81, lng: 10.18 },
  { name: "Le Caire", country: "Égypte", lat: 30.04, lng: 31.24 },
  { name: "Dakar", country: "Sénégal", lat: 14.72, lng: -17.47 },
  { name: "Abidjan", country: "Côte d'Ivoire", lat: 5.36, lng: -4.01 },
  { name: "Bamako", country: "Mali", lat: 12.64, lng: -8.0 },
  { name: "Douala", country: "Cameroun", lat: 4.05, lng: 9.7 },
  { name: "Kinshasa", country: "RD Congo", lat: -4.32, lng: 15.31 },
  { name: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.38 },
  { name: "Accra", country: "Ghana", lat: 5.6, lng: -0.19 },
  { name: "Nairobi", country: "Kenya", lat: -1.29, lng: 36.82 },
  { name: "Johannesburg", country: "Afrique du Sud", lat: -26.2, lng: 28.05 },
  { name: "Le Cap", country: "Afrique du Sud", lat: -33.92, lng: 18.42 },
  { name: "Antananarivo", country: "Madagascar", lat: -18.88, lng: 47.51 },
  // --- Amériques ---
  { name: "Montréal", country: "Canada", lat: 45.5, lng: -73.57 },
  { name: "Québec", country: "Canada", lat: 46.81, lng: -71.21 },
  { name: "Toronto", country: "Canada", lat: 43.65, lng: -79.38 },
  { name: "Vancouver", country: "Canada", lat: 49.28, lng: -123.12 },
  { name: "New York", country: "États-Unis", lat: 40.71, lng: -74.01 },
  { name: "Boston", country: "États-Unis", lat: 42.36, lng: -71.06 },
  { name: "Washington", country: "États-Unis", lat: 38.91, lng: -77.04 },
  { name: "Miami", country: "États-Unis", lat: 25.76, lng: -80.19 },
  { name: "Chicago", country: "États-Unis", lat: 41.88, lng: -87.63 },
  { name: "Austin", country: "États-Unis", lat: 30.27, lng: -97.74 },
  { name: "Denver", country: "États-Unis", lat: 39.74, lng: -104.99 },
  { name: "Seattle", country: "États-Unis", lat: 47.61, lng: -122.33 },
  { name: "San Francisco", country: "États-Unis", lat: 37.77, lng: -122.42 },
  { name: "Los Angeles", country: "États-Unis", lat: 34.05, lng: -118.24 },
  { name: "Mexico", country: "Mexique", lat: 19.43, lng: -99.13 },
  { name: "Bogota", country: "Colombie", lat: 4.71, lng: -74.07 },
  { name: "Lima", country: "Pérou", lat: -12.05, lng: -77.04 },
  { name: "Santiago", country: "Chili", lat: -33.45, lng: -70.67 },
  { name: "Buenos Aires", country: "Argentine", lat: -34.6, lng: -58.38 },
  { name: "São Paulo", country: "Brésil", lat: -23.55, lng: -46.63 },
  { name: "Rio de Janeiro", country: "Brésil", lat: -22.91, lng: -43.17 },
  { name: "Port-au-Prince", country: "Haïti", lat: 18.54, lng: -72.34 },
  // --- Moyen-Orient, Asie & Océanie ---
  { name: "Dubaï", country: "Émirats arabes unis", lat: 25.2, lng: 55.27 },
  { name: "Doha", country: "Qatar", lat: 25.29, lng: 51.53 },
  { name: "Riyad", country: "Arabie saoudite", lat: 24.71, lng: 46.68 },
  { name: "Beyrouth", country: "Liban", lat: 33.89, lng: 35.5 },
  { name: "Tel-Aviv", country: "Israël", lat: 32.09, lng: 34.78 },
  { name: "Mumbai", country: "Inde", lat: 19.08, lng: 72.88 },
  { name: "Delhi", country: "Inde", lat: 28.61, lng: 77.21 },
  { name: "Bangalore", country: "Inde", lat: 12.97, lng: 77.59 },
  { name: "Bangkok", country: "Thaïlande", lat: 13.76, lng: 100.5 },
  { name: "Hanoï", country: "Vietnam", lat: 21.03, lng: 105.85 },
  { name: "Hô Chi Minh-Ville", country: "Vietnam", lat: 10.82, lng: 106.63 },
  { name: "Singapour", country: "Singapour", lat: 1.35, lng: 103.82 },
  { name: "Kuala Lumpur", country: "Malaisie", lat: 3.14, lng: 101.69 },
  { name: "Jakarta", country: "Indonésie", lat: -6.21, lng: 106.85 },
  { name: "Manille", country: "Philippines", lat: 14.6, lng: 120.98 },
  { name: "Hong Kong", country: "Hong Kong", lat: 22.32, lng: 114.17 },
  { name: "Shanghai", country: "Chine", lat: 31.23, lng: 121.47 },
  { name: "Pékin", country: "Chine", lat: 39.9, lng: 116.41 },
  { name: "Shenzhen", country: "Chine", lat: 22.54, lng: 114.06 },
  { name: "Séoul", country: "Corée du Sud", lat: 37.57, lng: 126.98 },
  { name: "Tokyo", country: "Japon", lat: 35.68, lng: 139.69 },
  { name: "Osaka", country: "Japon", lat: 34.69, lng: 135.5 },
  { name: "Taipei", country: "Taïwan", lat: 25.03, lng: 121.57 },
  { name: "Sydney", country: "Australie", lat: -33.87, lng: 151.21 },
  { name: "Melbourne", country: "Australie", lat: -37.81, lng: 144.96 },
  { name: "Auckland", country: "Nouvelle-Zélande", lat: -36.85, lng: 174.76 },
];

/** Minuscules, sans accents, espaces/tirets normalisés — pour comparer des saisies. */
export function normalizeCityName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s\-–—']+/g, " ")
    .trim();
}

const CITY_INDEX = new Map(CITIES.map((city) => [normalizeCityName(city.name), city]));

/** Retrouve une ville de la liste à partir d'une saisie libre ("marseille ", "Fes"...). */
export function findCity(raw: string): City | undefined {
  return CITY_INDEX.get(normalizeCityName(raw));
}
