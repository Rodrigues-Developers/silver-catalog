import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  private minPriceSubject = new BehaviorSubject<number>(150);
  private maxPriceSubject = new BehaviorSubject<number>(2500);

  minPrice$ = this.minPriceSubject.asObservable();
  maxPrice$ = this.maxPriceSubject.asObservable();

  setMinPrice(price: number) {
    this.minPriceSubject.next(price);
  }

  setMaxPrice(price: number) {
    this.maxPriceSubject.next(price);
  }

  getMinPriceSubject() {
    return this.minPriceSubject;
  }

  getMaxPriceSubject() {
    return this.maxPriceSubject;
  }
}
