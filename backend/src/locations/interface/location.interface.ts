export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;

  // Operating Hours
  openingTime?: string | null;
  closingTime?: string | null;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
