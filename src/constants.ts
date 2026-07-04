export const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_144509_89e2d612-8af2-45c3-90f4-4831bc60715d.mp4';

export const HOW_IT_WORKS_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150112_2b0e700f-7af4-4459-b326-7d9e2f468daa.png&w=1280&q=85';

export type PropertyListing = {
  title: string;
  price: string;
  location: string;
  area: number;
  floors: number;
  beds: number;
  baths: number;
  image: string;
  type: 'buy' | 'rent' | 'pg-hostel';
};

export const PROPERTIES: PropertyListing[] = [
  // Buy Listings
  {
    title: 'Raarya Elite Villa Plots',
    price: '₹45,00,000',
    location: 'Saravanampatti, Coimbatore',
    area: 1500,
    floors: 0,
    beds: 0,
    baths: 0,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145701_de344c15-5eac-4c64-8bd6-19a2811bba4a.png&w=1280&q=85',
    type: 'buy'
  },
  {
    title: 'Raarya Green Meadows',
    price: '₹1,20,00,000',
    location: 'Kovaipudur, Coimbatore',
    area: 2400,
    floors: 2,
    beds: 3,
    baths: 3,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145923_c1a9880c-0fab-4a76-8289-bd650d5e5dce.png&w=1280&q=85',
    type: 'buy'
  },
  {
    title: 'Avinashi Road Commercial Plot',
    price: '₹2,50,00,000',
    location: 'Peelamedu, Coimbatore',
    area: 4000,
    floors: 0,
    beds: 0,
    baths: 0,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150022_cdda0eaa-1c17-4f59-8188-4f98b328619f.png&w=1280&q=85',
    type: 'buy'
  },
  // Rent Listings
  {
    title: 'Premium 2BHK Apartment',
    price: '₹22,000/mo',
    location: 'RS Puram, Coimbatore',
    area: 1200,
    floors: 1,
    beds: 2,
    baths: 2,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150112_2b0e700f-7af4-4459-b326-7d9e2f468daa.png&w=1280&q=85',
    type: 'rent'
  },
  {
    title: 'Cozy 3BHK Independent House',
    price: '₹35,000/mo',
    location: 'Ramanathapuram, Coimbatore',
    area: 1800,
    floors: 2,
    beds: 3,
    baths: 3,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150022_cdda0eaa-1c17-4f59-8188-4f98b328619f.png&w=1280&q=85',
    type: 'rent'
  },
  // PG / Hostel Listings
  {
    title: 'Raarya Executive Mens PG',
    price: '₹6,500/mo',
    location: 'Gandhipuram, Coimbatore',
    area: 250,
    floors: 0,
    beds: 1,
    baths: 1,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145923_c1a9880c-0fab-4a76-8289-bd650d5e5dce.png&w=1280&q=85',
    type: 'pg-hostel'
  },
  {
    title: 'Raarya Luxury Girls PG',
    price: '₹7,000/mo',
    location: 'Saravanampatti, Coimbatore',
    area: 300,
    floors: 0,
    beds: 1,
    baths: 1,
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145701_de344c15-5eac-4c64-8bd6-19a2811bba4a.png&w=1280&q=85',
    type: 'pg-hostel'
  }
];

export const CHART_CARDS = [
  { title: 'Annual growth', value: '19%', data: [35, 60, 45, 40, 55, 75, 60, 80, 55, 30] },
  { title: 'Aggregate yield profit', value: '₹8,20,000', data: [8, 12, 18, 28, 32, 38, 55, 70, 85] },
  { title: 'Median returns', value: '14%', data: [10, 75, 20, 35, 30, 65, 55, 25, 40] },
] as const;
