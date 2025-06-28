import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../services/auth';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RoleGuard implements CanActivate {
  constructor(
    private authService: Auth,
    private router: Router
  ){
    console.log('RoleGuard Initialized');
    
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
      const requiredRoles =route.data['roles'] as string[];
      const routePath = state.url;

      console.log('[RoleGuard]: Checking roles for route', routePath);
      console.log('[RoleGuard]: Required roles', requiredRoles);

      return this.authService.currentUser$.pipe(
        take(1),
        map(user => {
          if(!user){
            console.log('[RoleGuard]: User not found, redirecting to login');
            this.router.navigate(['/login'],{
              queryParams: {returnUrl: routePath}
            });
            return false;
          }
          if(!requiredRoles || requiredRoles.length === 0){
            console.log('[RoleGuard]: No roles required , allowing access');
            
            return true;
          }

          const hasPermission = this.authService.hasAnyRole(requiredRoles);

          if(hasPermission) {
            console.log('[RoleGuard]: User has required role, allowing access');
            return true;
          }
          else{
            console.log('[RoleGuard]: User does not have required role, rerouting to 403');

            this.router.navigate(['/unauthorized'],{
              queryParams:{
                type: '403',
                route: routePath
              }
            })
            return false;
          }


          
        })
      )
      
      
      }
}
