import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class UnauthorizedComponent implements OnInit {
  currentUserRole: string | null = null;
  errorType: '403' | '404' = '403';
  errorTitle: string = '';
  errorMessage: string = '';
  attemptedRoute: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: Auth
  ) {
    console.log('UnauthorizedComponent initialized');
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUserRole = user?.role || null;
      console.log('👤 Current user role in unauthorized page:', this.currentUserRole);
    });
  }

  ngOnInit(): void {
    // Check query parameters to determine error type
    this.route.queryParams.subscribe(params => {
      this.errorType = params['type'] || '403';
      this.attemptedRoute = params['route'] || 'unknown';
      
      this.setErrorContent();
      
      console.log('Error page loaded:', {
        type: this.errorType,
        route: this.attemptedRoute,
        userRole: this.currentUserRole
      });
    });
  }

  private setErrorContent(): void {
    if (this.errorType === '404') {
      this.errorTitle = 'Page Not Found';
      this.errorMessage = 'The page you are looking for does not exist or has been moved.';
    } else {
      this.errorTitle = 'Access Denied';
      this.errorMessage = 'You don\'t have permission to access this resource.';
    }
  }

  goBack(): void {
    console.log(' Going back in history');
    window.history.back();
  }

  goToDashboard(): void {
    console.log(' Navigating to dashboard');
    this.router.navigate(['/dashboard']);
  }

  goToLogin(): void {
    console.log('Navigating to login');
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.attemptedRoute } 
    });
  }

  logout(): void {
    console.log('Logging out from error page');
    this.authService.logout();
  }

  // Get appropriate icon for error type
  getErrorIcon(): string {
    return this.errorType === '404' ? '🔍' : '🔒';
  }

  // Get appropriate color scheme
  getErrorColorClass(): string {
    return this.errorType === '404' ? 'text-blue-500' : 'text-red-500';
  }

  getBorderColorClass(): string {
    return this.errorType === '404' ? 'border-blue-200' : 'border-red-200';
  }

  getBackgroundColorClass(): string {
    return this.errorType === '404' ? 'bg-blue-50' : 'bg-red-50';
  }
}