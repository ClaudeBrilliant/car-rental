import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, AuthResponse, User } from './auth/auth';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = 'http://localhost:3000/auth';
  private readonly TOKEN_KEY = 'hotel_auth_token';
  private readonly USER_KEY = 'hotel_user_data';
  
  // BehaviorSubject to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  
  // Public observables for components to subscribe to
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log(' AuthService initialized');
    console.log(' Current auth state:', {
      isAuthenticated: this.isAuthenticatedSubject.value,
      user: this.currentUserSubject.value
    });
  }

  /**
   * Login user - connects to your NestJS backend
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log(' AuthService: Attempting login for', credentials.email);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          console.log(' Login successful:', response.user);
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log(' AuthService: Attempting registration for', userData.email);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          console.log(' Registration successful:', response.user);
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('🚪 AuthService: Logging out user');
    
    // Clear storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Update subjects
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/login']);
    
    console.log(' Logout complete');
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const hasRole = user?.role === role;
    console.log(`🔍 Role check: User ${user?.email} ${hasRole ? 'HAS' : 'DOES NOT HAVE'} role ${role}`);
    return hasRole;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const hasAnyRole = roles.includes(user.role);
    console.log(`🔍 Multi-role check: User ${user.email} ${hasAnyRole ? 'HAS' : 'DOES NOT HAVE'} any of roles:`, roles);
    return hasAnyRole;
  }

  /**
   * Validate token with backend
   */
  validateToken(): Observable<User> {
    console.log('🔍 AuthService: Validating token with backend');
    
    return this.http.post<{ user: User }>(`${this.API_URL}/validate`, {})
      .pipe(
        tap(response => {
          console.log(' Token validation successful:', response.user);
          this.currentUserSubject.next(response.user);
          this.storeUserData(response.user);
        }),
        map(response => response.user)
      );
  }

  // Private helper methods
  private storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    console.log('Auth data stored in localStorage');
  }

  private storeUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token; // In production, you'd also check expiration
  }

  private getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error(' Failed to parse user data from storage:', error);
        return null;
      }
    }
    return null;
  }
}