import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Vehicle, VehicleSearchFilter, VehicleAvailability, VehicleCategory } from '../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly API_URL = 'https://api.carrent.com/vehicles';
  private searchFiltersSubject = new BehaviorSubject<VehicleSearchFilter>({});
  
  public searchFilters$ = this.searchFiltersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getVehicles(page: number = 1, limit: number = 12, filters?: VehicleSearchFilter): Observable<{vehicles: Vehicle[], total: number, page: number, totalPages: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.category?.length) {
        params = params.set('category', filters.category.join(','));
      }
      if (filters.transmission?.length) {
        params = params.set('transmission', filters.transmission.join(','));
      }
      if (filters.fuelType?.length) {
        params = params.set('fuelType', filters.fuelType.join(','));
      }
      if (filters.priceRange) {
        params = params.set('minPrice', filters.priceRange.min.toString());
        params = params.set('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.seats?.length) {
        params = params.set('seats', filters.seats.join(','));
      }
      if (filters.location) {
        params = params.set('location', filters.location);
      }
      if (filters.pickupDate) {
        params = params.set('pickupDate', filters.pickupDate.toISOString());
      }
      if (filters.returnDate) {
        params = params.set('returnDate', filters.returnDate.toISOString());
      }
      if (filters.features?.length) {
        params = params.set('features', filters.features.join(','));
      }
    }

    return this.http.get<{vehicles: Vehicle[], total: number, page: number, totalPages: number}>(`${this.API_URL}`, { params });
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.API_URL}/${id}`);
  }

  getFeaturedVehicles(limit: number = 6): Observable<Vehicle[]> {
    const params = new HttpParams()
      .set('featured', 'true')
      .set('limit', limit.toString());
    
    return this.http.get<{vehicles: Vehicle[]}>(`${this.API_URL}`, { params })
      .pipe(map(response => response.vehicles));
  }

  getVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date): Observable<VehicleAvailability> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<VehicleAvailability>(`${this.API_URL}/${vehicleId}/availability`, { params });
  }

  searchVehicles(query: string): Observable<Vehicle[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<{vehicles: Vehicle[]}>(`${this.API_URL}/search`, { params })
      .pipe(map(response => response.vehicles));
  }

  getVehiclesByCategory(category: VehicleCategory, limit: number = 8): Observable<Vehicle[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('limit', limit.toString());
    
    return this.http.get<{vehicles: Vehicle[]}>(`${this.API_URL}`, { params })
      .pipe(map(response => response.vehicles));
  }

  updateSearchFilters(filters: VehicleSearchFilter): void {
    this.searchFiltersSubject.next(filters);
  }

  get currentFilters(): VehicleSearchFilter {
    return this.searchFiltersSubject.value;
  }

  // Admin/Agent methods
  createVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.API_URL}`, vehicle);
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.API_URL}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  uploadVehicleImages(vehicleId: string, images: File[]): Observable<string[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    
    return this.http.post<string[]>(`${this.API_URL}/${vehicleId}/images`, formData);
  }
}