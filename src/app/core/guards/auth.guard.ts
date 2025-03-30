import { inject, Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { Auth, user } from "@angular/fire/auth";
import { Observable, of } from "rxjs";
import { switchMap, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRole = route.data["role"]; // Get the required role from route data
    const isOrderRoute = route.routeConfig?.path?.startsWith("order");

    return user(this.auth).pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) {
          this.router.navigate(["/"]); // Redirect if not authenticated
          return of(false);
        }

        return firebaseUser.getIdTokenResult().then((idTokenResult) => {
          const claims = idTokenResult.claims;

          // If no specific role is required, just check authentication
          if (!requiredRole && !isOrderRoute) {
            return true;
          }

          // Check if the user's role matches the required role
          if (requiredRole && (claims[requiredRole] as string)?.includes("admin")) {
            return true;
          }

          // Check if the user is accessing their own orders or is an admin
          if (isOrderRoute) {
            const userId = firebaseUser.uid;
            const orderId = route.params["id"];
            if (claims["admin"] || orderId === userId) {
              return true;
            }
          }

          this.router.navigate(["/forbidden"]); // Redirect if not authorized
          return false;
        });
      })
    );
  }
}
