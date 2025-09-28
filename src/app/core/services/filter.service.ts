import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  private minPriceSubject = new BehaviorSubject<number>(0);
  private maxPriceSubject = new BehaviorSubject<number>(10000);
  private selectedCategoriesSubject = new BehaviorSubject<string[]>([]);
  private searchQuerySubject = new BehaviorSubject<string>("");

  minPrice$ = this.minPriceSubject.asObservable();
  maxPrice$ = this.maxPriceSubject.asObservable();
  selectedCategories$ = this.selectedCategoriesSubject.asObservable();
  searchQuery$ = this.searchQuerySubject.asObservable();

  setMinPrice(price: number) {
    this.minPriceSubject.next(price);
  }

  setMaxPrice(price: number) {
    this.maxPriceSubject.next(price);
  }

  setSelectedCategories(categories: string[]) {
    this.selectedCategoriesSubject.next(categories);
  }

  setSearchQuery(query: string) {
    this.searchQuerySubject.next(query);
  }

  resetFilters() {
    this.minPriceSubject.next(0);
    this.maxPriceSubject.next(10000);
    this.selectedCategoriesSubject.next([]);
    this.searchQuerySubject.next("");
  }

  getMinPriceSubject() {
    return this.minPriceSubject;
  }

  getMaxPriceSubject() {
    return this.maxPriceSubject;
  }

  getSelectedCategoriesSubject() {
    return this.selectedCategoriesSubject;
  }

  getSearchQuery(): string {
    return this.searchQuerySubject.getValue();
  }
}
