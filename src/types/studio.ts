export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  price: number;
  pricePrefix?: boolean;
  category: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  durationHours: number;
  price: number;
  date: string; // YYYY-MM-DD
  startHour: number; // 9..19
  endHour: number;
  boxNumber: number; // 1..boxesCount
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  carModel: string;
  status: BookingStatus;
  createdAt: string;
}

export interface StudioConfig {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  address: string;
  boxesCount: number;
  workStartHour: number;
  workEndHour: number;
  closedDates: string[]; // YYYY-MM-DD
  heroImage: string;
  logoType: 'bars' | 'letter';
  logoLetter: string;
  logoColor: string;
  showcaseTitle: string;
  showcaseSubtitle: string;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
}

export interface SlotAvailability {
  hour: number;
  timeLabel: string;
  available: boolean;
  freeBoxes: number[];
}
