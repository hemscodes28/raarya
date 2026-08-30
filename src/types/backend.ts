/**
 * Raarya Properties - Backend Data Contracts & Interfaces
 * Compatible with Node.js/Express REST APIs & PHP Form Endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  property?: T;
  properties?: T[];
  enquiries?: T[];
  isMocked?: boolean;
  otp?: string;
  content?: string;
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  password?: string;
  whatsapp?: string;
  avatar?: string;
  createdAt?: string;
}

export interface SignupPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
}

export interface LoginPayload {
  phone: string;
  password?: string;
}

export interface OtpRequestPayload {
  phone: string;
  email?: string;
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string;
}

export interface PropertyListingPayload {
  id?: string;
  userEmail: string;
  title: string;
  price: string;
  priceType?: string;
  state?: string;
  district?: string;
  city?: string;
  location?: string;
  propertyType?: string;
  type?: 'buy' | 'rent' | 'pg-hostel';
  subType?: string;
  area?: string;
  description?: string;
  agentName?: string;
  agentPhone?: string;
  userName?: string;
  youAre?: string;
  propertyFor?: string;
  locality?: string;
  mapLink?: string;
  areaUnit?: string;
  coverImage?: string;
  contactMobile?: string;
  contactEmail?: string;
  images?: string[];
  status?: 'Pending' | 'Approved' | 'Rejected';
  sold?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface PropertyQueryFilters {
  type?: 'buy' | 'rent' | 'pg-hostel';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  searchQuery?: string;
}

export interface ContactEnquiryPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyName?: string;
  ownerEmail?: string;
  reason?: string;
  whoAreYou?: string;
  planningToBuy?: string;
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
}
