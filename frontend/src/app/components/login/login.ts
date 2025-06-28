import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { LoginRequest, RegisterRequest } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  // Form modes
  isLoginMode = true;
  
  // Loading states
  isLoading = false;
  
  // Error handling
  error: string | null = null;
  
  // Form data
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    role: 'GUEST'
  };
  
  // Return URL for redirect after login
  returnUrl: string = '/dashboard';
  

  constructor(
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log(' LoginComponent initialized');
  }

  ngOnInit(): void {
    // Get return URL from route parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log(' Return URL set to:', this.returnUrl);
    
    // Check if already authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log(' User already authenticated, redirecting to:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  // Login form submission
  onLogin(): void {
    if (!this.isValidLoginForm()) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    console.log(' Attempting login with:', this.loginData.email);
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log(' Login successful, redirecting to:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(' Login failed:', error);
        this.error = error.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Register form submission
  onRegister(): void {
    if (!this.isValidRegisterForm()) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    console.log(' Attempting registration with:', this.registerData.email);
    
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log(' Registration successful, redirecting to:', this.returnUrl);
        this.router.navigate([this.returnUrl]);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(' Registration failed:', error);
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Demo login for training purposes
  loginWithDemo(credentials: any): void {
    this.loginData = {
      email: credentials.email,
      password: credentials.password
    };
    
    console.log('🎭 Demo login as:', credentials.label);
    this.onLogin();
  }

  // Toggle between login and register modes
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    console.log('🔄 Switched to:', this.isLoginMode ? 'Login' : 'Register', 'mode');
  }

  // Form validation
   isValidLoginForm(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

   isValidRegisterForm(): boolean {
    return !!(this.registerData.name && 
             this.registerData.email && 
             this.registerData.password);
  }
}
