export class CreateLocationDto {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
}
