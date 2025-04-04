import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Product, TopProduct } from "../app/interfaces/products.interface";
import { Category } from "../app/interfaces/category.interface"; // Import the Category interface
import { AuthService } from "../app/core/services/auth.service"; // Import the AuthService
import { environment } from "../environments/environment";
import { Banner } from "./interfaces/banner.interface";
import { Order } from "./interfaces/order.interface";

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

  getProducts(sortBy?: keyof Product, ascending = false): Observable<Product[]> {
    let params = new HttpParams();

    if (sortBy) {
      params = params.set("sortBy", sortBy);
      params = params.set("ascending", ascending.toString());
    }

    return this.http.get<Product[]>(`${this.config.apiUri}/api/Product`, { params });
  }

  getProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.config.apiUri}/api/Product/${productId}`);
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

  checkIfProductHasCategory(categoryId: string): Observable<boolean> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.get<boolean>(`${this.config.apiUri}/api/Product/has-category/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.config.apiUri}/api/Product/products-category/${categoryId}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set("name", query);
    return this.http.get<Product[]>(`${this.config.apiUri}/api/Product/product-search`, { params });
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.config.apiUri}/api/Category`);
  }

  getCategory(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.config.apiUri}/api/Category/${categoryId}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.post<Category>(`${this.config.apiUri}/api/Category`, category, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  updateCategory(categoryId: string, category: Partial<Category>): Observable<Category> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.put<Category>(`${this.config.apiUri}/api/Category/${categoryId}`, category, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  deleteCategory(categoryId: string): Observable<void> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.delete<void>(`${this.config.apiUri}/api/Category/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  //Banners
  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.config.apiUri}/api/Banner`);
  }

  createBanner(banner: Banner): Observable<Banner> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.post<Banner>(`${this.config.apiUri}/api/Banner`, banner, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  updateBanner(bannerId: string, banner: Partial<Banner>): Observable<Banner> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.put<Banner>(`${this.config.apiUri}/api/Banner/${bannerId}`, banner, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  deleteBanner(bannerId: string): Observable<void> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.delete<void>(`${this.config.apiUri}/api/Banner/${bannerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  //Orders
  getOrders(): Observable<Order[]> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.get<Order[]>(`${this.config.apiUri}/api/Order`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  getOrder(orderId: string): Observable<Order> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.get<Order>(`${this.config.apiUri}/api/Order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  createOrder(order: Order): Observable<Order> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.post<Order>(`${this.config.apiUri}/api/Order`, order, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  updateOrder(orderId: string, order: Partial<Order>): Observable<void> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.put<void>(`${this.config.apiUri}/api/Order/${orderId}`, order, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.getFirebaseToken().pipe(
      switchMap((token) =>
        this.http.delete<void>(`${this.config.apiUri}/api/Order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  getProductCountByCategory(id: string): Observable<number> {
    return this.http.get<number>(`${this.config.apiUri}/api/Product/category-count/${id}`);
  }

  getTopSellers(): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.config.apiUri}/api/Order/top-selling`);
  }
}
