import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../services/auth';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: Auth,
    private router: Router
  ){
    console.log('Authguard initialized');
    
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      console.log('[AuthGuard]: Checking authentication for route', state.url);

      return this.authService.isAuthenticated$.pipe(
        take(1),
        map(isAuthenticated => {
            if(isAuthenticated) {
              console.log('[AuthGuard]: User is authenticated,allowing access');
              return true;
            } else {
              console.log('[AuthGuard]: User is not authenticated rerouting to login');
              this.router.navigate(['/login'], {
                queryParams: {returnUrl: state.url}
              });
              return false;
            }

        })
      )
      
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      return this.canActivate(childRoute, state);
  }
}
