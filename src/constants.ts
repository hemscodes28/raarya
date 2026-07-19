import extractedListings from './data/extracted_properties.json';

export const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_144509_89e2d612-8af2-45c3-90f4-4831bc60715d.mp4';

export const HOW_IT_WORKS_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150112_2b0e700f-7af4-4459-b326-7d9e2f468daa.png&w=1280&q=85';

export type PropertyListing = {
  id?: string;
  title: string;
  price: string;
  location: string;
  area: number;
  floors: number;
  beds: number;
  baths: number;
  image: string;
  type: 'buy' | 'rent' | 'pg-hostel';
  subType?: string;
  link?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  agentName?: string;
  agentPhones?: string[];
  overviewDetails?: Record<string, string>;
  googleMapsUrl?: string;
  mapEmbedUrl?: string;
  mapQuery?: string;
  agentPhone?: string;
  areaDisplay?: string;
  areaUnit?: string;
  descriptionPoints?: string[];
};

export const PROPERTIES: PropertyListing[] = (extractedListings as PropertyListing[]);

export const CHART_CARDS = [
  { title: 'Annual growth', value: '19%', data: [35, 60, 45, 40, 55, 75, 60, 80, 55, 30] },
  { title: 'Aggregate yield profit', value: '₹8,20,000', data: [8, 12, 18, 28, 32, 38, 55, 70, 85] },
  { title: 'Median returns', value: '14%', data: [10, 75, 20, 35, 30, 65, 55, 25, 40] },
] as const;
