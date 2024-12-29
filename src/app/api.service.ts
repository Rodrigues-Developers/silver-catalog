import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Product } from "src/app/interfaces/products.interface";
import { AuthService } from "../app/core/services/auth.service"; // Import the AuthService
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  config = {
    apiUri: environment.apiUri,
    appUri: environment.appUri,
    errorPath: environment.errorPath,
  };
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Method to get the current Firebase token for the authenticated user
  private getFirebaseToken(): Observable<string> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (user) {
          return from(user.getIdToken()); // Get the ID token of the current user
        } else {
          return new Observable<string>((observer) => {
            observer.error("User not authenticated");
            observer.complete();
          });
        }
      })
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.config.apiUri}/api/Product`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.post<Product>(`${this.config.apiUri}/api/Product`, product, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  updateProduct(productId: string, product: Partial<Product>): Observable<Product> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.put<Product>(`${this.config.apiUri}/api/Product/${productId}`, product, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.delete<void>(`${this.config.apiUri}/api/Product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }
}
