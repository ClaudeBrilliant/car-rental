import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { VehicleBookingService, VehicleBookingResponse, PaginatedResponse } from '../../services/vehicle-booking.service';

@Component({
  selector: 'app-vehicle-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehicle-booking-management.component.html',
  styleUrl: './vehicle-booking-management.component.css'
})
export class VehicleBookingManagementComponent implements OnInit, OnDestroy {
  // Reactive form properties
  bookingForm!: FormGroup;
  showNewBookingForm = false;

  // Component state
  bookings: VehicleBookingResponse[] = [];
  todaysPickups: VehicleBookingResponse[] = [];
  todaysReturns: VehicleBookingResponse[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingPickups = false;
  isLoadingReturns = false;
  
  // Error handling
  error: string | null = null;
  
  // Filters and search
  searchTerm = '';
  selectedStatus = '';
  currentPage = 1;
  totalBookings = 0;
  
  // Search subject for debounced search
  private searchSubject = new Subject<string>();
  
  // Subscription management
  private subscriptions = new Subscription();
  
  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'picked-up', label: 'On Rent' },
    { value: 'returned', label: 'Returned' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Vehicle types
  vehicleTypes = [
    { value: 'economy', label: 'Economy Car - $45/day', category: 'car' },
    { value: 'compact', label: 'Compact Car - $55/day', category: 'car' },
    { value: 'midsize', label: 'Midsize Car - $65/day', category: 'car' },
    { value: 'fullsize', label: 'Full-size Car - $75/day', category: 'car' },
    { value: 'luxury', label: 'Luxury Car - $120/day', category: 'car' },
    { value: 'suv', label: 'SUV - $85/day', category: 'suv' },
    { value: 'van', label: 'Van - $95/day', category: 'van' },
    { value: 'truck', label: 'Pickup Truck - $80/day', category: 'truck' }
  ];

  constructor(
    private vehicleBookingService: VehicleBookingService, 
    private fb: FormBuilder
  ) {
    console.log('VehicleBookingManagement Constructor: Component instantiated');
    console.log('Constructor: VehicleBookingService injected via DI');
  }

  // OnInit - HTTP Client setup and initial data loading
  ngOnInit(): void {
    console.log('OnInit: Setting up HTTP Client operations');
    
    // Load initial data via HTTP
    this.loadBookings();
    this.loadTodaysActivities();
    
    // Setup debounced search using RxJS operators
    this.setupDebouncedSearch();
    
    console.log('OnInit: All HTTP subscriptions configured');

    this.createBookingForm();
  }

  // OnDestroy - HTTP subscription cleanup
  ngOnDestroy(): void {
    console.log('OnDestroy: Cleaning up HTTP subscriptions');
    
    // Unsubscribe from all HTTP operations
    this.subscriptions.unsubscribe();
    
    // Complete search subject
    this.searchSubject.complete();
    
    console.log('OnDestroy: All HTTP subscriptions cleaned up');
  }

  toggleNewBookingForm(): void {
    this.showNewBookingForm = !this.showNewBookingForm;
    if (this.showNewBookingForm) {
      this.bookingForm.reset({ driverAge: 25 });
    }
  }

  // HTTP Client data loading methods
  private loadBookings(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('HTTP Request: Loading vehicle bookings with pagination');
    
    // Create HTTP subscription for bookings
    const bookingsSubscription = this.vehicleBookingService.getBookings(this.currentPage, 10, this.selectedStatus)
      .pipe(
        catchError(error => {
          console.error('HTTP Error:', error.message);
          this.error = error.message;
          return of({ data: [], total: 0, page: 1, limit: 10 } as PaginatedResponse<VehicleBookingResponse>);
        })
      )
      .subscribe({
        next: (response: PaginatedResponse<VehicleBookingResponse>) => {
          this.bookings = response.data;
          this.totalBookings = response.total;
          this.isLoading = false;
          console.log('HTTP Success: Vehicle bookings loaded', {
            count: response.data.length,
            total: response.total,
            page: response.page
          });
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = 'Failed to load vehicle bookings';
          console.error('HTTP Subscription Error:', error);
        }
      });

    this.subscriptions.add(bookingsSubscription);
  }

  private loadTodaysActivities(): void {
    console.log('HTTP Request: Loading today\'s vehicle activities');
    
    // Load today's pickups
    this.isLoadingPickups = true;
    const pickupsSubscription = this.vehicleBookingService.getTodaysPickups()
      .pipe(
        catchError(error => {
          console.error('HTTP Error (Pickups):', error.message);
          return of([]);
        })
      )
      .subscribe({
        next: (pickups: VehicleBookingResponse[]) => {
          this.todaysPickups = pickups;
          this.isLoadingPickups = false;
          console.log('HTTP Success: Vehicle pickups loaded', pickups.length);
        }
      });

    // Load today's returns
    this.isLoadingReturns = true;
    const returnsSubscription = this.vehicleBookingService.getTodaysReturns()
      .pipe(
        catchError(error => {
          console.error('HTTP Error (Returns):', error.message);
          return of([]);
        })
      )
      .subscribe({
        next: (returns: VehicleBookingResponse[]) => {
          this.todaysReturns = returns;
          this.isLoadingReturns = false;
          console.log('HTTP Success: Vehicle returns loaded', returns.length);
        }
      });

    this.subscriptions.add(pickupsSubscription);
    this.subscriptions.add(returnsSubscription);
  }

  // Debounced search setup using RxJS operators
  private setupDebouncedSearch(): void {
    console.log('Setting up debounced search with RxJS operators');
    
    const searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        switchMap(query => {
          console.log('Debounced search triggered:', query);
          
          if (!query.trim()) {
            // If search is empty, load regular bookings
            return this.vehicleBookingService.getBookings(1, 10, this.selectedStatus);
          } else {
            // Search bookings
            return this.vehicleBookingService.searchBookings(query)
              .pipe(
                // Transform search results to match expected format
                switchMap(results => {
                  const typedResults = results as VehicleBookingResponse[];
                  return of({
                    data: typedResults,
                    total: typedResults.length,
                    page: 1,
                    limit: 10
                  } as PaginatedResponse<VehicleBookingResponse>);
                })
              );
          }
        }),
        catchError(error => {
          console.error('Search HTTP Error:', error.message);
          this.error = 'Search failed: ' + error.message;
          return of({ data: [], total: 0, page: 1, limit: 10 } as PaginatedResponse<VehicleBookingResponse>);
        })
      )
      .subscribe({
        next: (response) => {
          this.bookings = response.data;
          this.totalBookings = response.total;
          this.currentPage = 1; // Reset to first page for search results
          console.log('Debounced search completed:', response.data.length, 'results');
        }
      });

    this.subscriptions.add(searchSubscription);
  }

  // Public methods for template
  onSearchChange(query: string): void {
    console.log('Search input changed:', query);
    this.searchTerm = query;
    // Trigger debounced search
    this.searchSubject.next(query);
  }

  onStatusFilterChange(): void {
    console.log('Status filter changed:', this.selectedStatus);
    this.currentPage = 1; // Reset pagination
    this.loadBookings(); // Immediate HTTP request for filter
  }

  onPageChange(page: number): void {
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.loadBookings(); // HTTP request for new page
  }

  pickupVehicle(booking: VehicleBookingResponse): void {
    console.log('HTTP Request: Processing vehicle pickup', booking.id);
    
    const pickupSubscription = this.vehicleBookingService.pickupVehicle(booking.id)
      .pipe(
        catchError(error => {
          console.error('Pickup HTTP Error:', error.message);
          this.error = 'Vehicle pickup failed: ' + error.message;
          return of(null);
        })
      )
      .subscribe({
        next: (updatedBooking: VehicleBookingResponse | null) => {
          if (updatedBooking) {
            // Update local data
            const index = this.bookings.findIndex(b => b.id === booking.id);
            if (index !== -1) {
              this.bookings[index] = updatedBooking;
            }
            
            // Refresh today's activities
            this.loadTodaysActivities();
            
            console.log('HTTP Success: Vehicle picked up', updatedBooking.id);
          }
        }
      });

    this.subscriptions.add(pickupSubscription);
  }

  returnVehicle(booking: VehicleBookingResponse): void {
    console.log('HTTP Request: Processing vehicle return', booking.id);
    
    const returnSubscription = this.vehicleBookingService.returnVehicle(booking.id)
      .pipe(
        catchError(error => {
          console.error('Return HTTP Error:', error.message);
          this.error = 'Vehicle return failed: ' + error.message;
          return of(null);
        })
      )
      .subscribe({
        next:(updatedBooking: VehicleBookingResponse | null) => {
          if (updatedBooking) {
            // Update local data
            const index = this.bookings.findIndex(b => b.id === booking.id);
            if (index !== -1) {
              this.bookings[index] = updatedBooking;
            }
            
            // Refresh today's activities
            this.loadTodaysActivities();
            
            console.log('HTTP Success: Vehicle returned', updatedBooking.id);
          }
        }
      });

    this.subscriptions.add(returnSubscription);
  }

  cancelBooking(booking: VehicleBookingResponse): void {
    console.log('HTTP Request: Cancelling vehicle booking', booking.id);
    
    const cancelSubscription = this.vehicleBookingService.cancelBooking(booking.id)
      .pipe(
        catchError(error => {
          console.error('Cancel HTTP Error:', error.message);
          this.error = 'Cancellation failed: ' + error.message;
          return of(null);
        })
      )
      .subscribe({
        next: (updatedBooking: VehicleBookingResponse | null) => {
          if (updatedBooking) {
            // Update local data
            const index = this.bookings.findIndex(b => b.id === booking.id);
            if (index !== -1) {
              this.bookings[index] = updatedBooking;
            }
            
            console.log('HTTP Success: Vehicle booking cancelled', updatedBooking.id);
          }
        }
      });

    this.subscriptions.add(cancelSubscription);
  }

  refreshData(): void {
    console.log('Manual refresh: Triggering all HTTP requests');
    this.error = null;
    this.loadBookings();
    this.loadTodaysActivities();
  }

  // Helper methods
  trackByBookingId(index: number, booking: VehicleBookingResponse): string {
    return booking.id;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'picked-up': 'bg-green-100 text-green-800',
      'returned': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  }

  canPickup(booking: VehicleBookingResponse): boolean {
    return booking.status === 'confirmed';
  }

  canReturn(booking: VehicleBookingResponse): boolean {
    return booking.status === 'picked-up';
  }

  canCancel(booking: VehicleBookingResponse): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  getTotalPages(): number {
    return Math.ceil(this.totalBookings / 10);
  }

  private createBookingForm(): void {
    this.bookingForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneValidator]],
      licenseNumber: ['', [Validators.required, Validators.minLength(5)]],
      pickupDate: ['', [Validators.required, this.futureDateValidator]],
      returnDate: ['', [Validators.required]],
      vehicleType: ['', [Validators.required]],
      driverAge: [25, [Validators.required, Validators.min(21), Validators.max(80)]],
      pickupLocation: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  private phoneValidator(control: AbstractControl) {
    const phone = control.value;
    return phone && phone.length >= 10 ? null : { invalidPhone: true };
  }

  private futureDateValidator(control: AbstractControl) {
    const date = new Date(control.value);
    return date > new Date() ? null : { pastDate: true };
  }

  private dateRangeValidator(form: AbstractControl) {
    const pickupDate = form.get('pickupDate')?.value;
    const returnDate = form.get('returnDate')?.value;

    return pickupDate && returnDate && new Date(returnDate) <= new Date(pickupDate) 
      ? { invalidDateRange: true } : null;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.bookingForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['minlength']) return 'Too short';
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['invalidPhone']) return 'Phone number must be at least 10 digits';
      if (field.errors['pastDate']) return 'Date must be in the future';
      if (field.errors['min']) return 'Minimum age is 21';
      if (field.errors['max']) return 'Maximum age is 80';
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.controls[key].markAsTouched();
    });
  }

  onSubmitNewBooking(): void {
    if (this.bookingForm.valid) {
      console.log('New Vehicle Booking:', this.bookingForm.value);

      // Here you would typically call the service to create the booking
      // this.vehicleBookingService.createBooking(this.bookingForm.value)

      this.showNewBookingForm = false;
      this.bookingForm.reset({ driverAge: 25 });
    } else {
      this.markFormGroupTouched();
    }
  }

  getVehicleIcon(vehicleType: string): string {
    const icons = {
      'economy': '🚗',
      'compact': '🚗',
      'midsize': '🚙',
      'fullsize': '🚙',
      'luxury': '🏎️',
      'suv': '🚐',
      'van': '🚐',
      'truck': '🚚'
    };
    return icons[vehicleType as keyof typeof icons] || '🚗';
  }
}