import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  private minPriceSubject = new BehaviorSubject<number>(50);
  private maxPriceSubject = new BehaviorSubject<number>(2500);
  private selectedCategoriesSubject = new BehaviorSubject<string[]>([]);

  minPrice$ = this.minPriceSubject.asObservable();
  maxPrice$ = this.maxPriceSubject.asObservable();
  selectedCategories$ = this.selectedCategoriesSubject.asObservable();

  setMinPrice(price: number) {
    this.minPriceSubject.next(price);
  }

  setMaxPrice(price: number) {
    this.maxPriceSubject.next(price);
  }

  setSelectedCategories(categories: string[]) {
    this.selectedCategoriesSubject.next(categories);
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
}
