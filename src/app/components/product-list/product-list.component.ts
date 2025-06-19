import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";
import { Router } from "@angular/router";
import { FilterService } from "src/app/core/services/filter.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-product-list",
  imports: [CommonModule, CapitalizePipe],
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.less"],
  standalone: true,
})
export class ProductListComponent implements OnInit, OnDestroy {
  hasApiError = false;
  productsList: Product[] = [];
  filteredProductsList: Product[] = [];
  minPriceSubsCription: Subscription;
  maxPriceSubsCription: Subscription;
  selectedCategoriesSubsCription: Subscription;
  searchQuerySubsCription: Subscription;

  constructor(private api: ApiService, private router: Router, private filterService: FilterService) {}

  ngOnInit(): void {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.productsList = res as Product[];
        this.filteredProductsList = this.productsList;
      },
      error: () => (this.hasApiError = true),
    });

    this.minPriceSubsCription = this.filterService.minPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.maxPriceSubsCription = this.filterService.maxPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.selectedCategoriesSubsCription = this.filterService.selectedCategories$.subscribe(() => {
      this.applyFilters();
    });

    this.searchQuerySubsCription = this.filterService.searchQuery$.subscribe((query) => {
      this.onSearchClick(query);
    });
  }

  applyFilters() {
    const selectedCategories = this.filterService.getSelectedCategoriesSubject().getValue();

    if (this.productsList.length === 0 && selectedCategories.length === 0) {
      return;
    }

    const minPrice = this.filterService.getMinPriceSubject().getValue();
    const maxPrice = this.filterService.getMaxPriceSubject().getValue();

    if (selectedCategories.length > 0) {
      this.api.getProductsByCategory(selectedCategories[0]).subscribe({
        next: (res) => {
          this.hasApiError = false;
          this.filteredProductsList = res as Product[];
          this.filteredProductsList = this.filteredProductsList.filter((product) => product.price >= minPrice && product.price <= maxPrice);
        },
        error: () => (this.hasApiError = true),
      });
    } else {
      this.filteredProductsList = this.productsList.filter((product) => product.price >= minPrice && product.price <= maxPrice);
    }
  }

  onSearchClick(query: string) {
    if (query.trim() === "") {
      this.applyFilters();
    } else {
      this.api.searchProducts(query).subscribe({
        next: (res) => {
          this.hasApiError = false;
          this.filteredProductsList = res as Product[];
        },
        error: () => (this.hasApiError = true),
      });
    }
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }

  ngOnDestroy(): void {
    this.minPriceSubsCription?.unsubscribe();
    this.maxPriceSubsCription?.unsubscribe();
    this.selectedCategoriesSubsCription?.unsubscribe();
    this.searchQuerySubsCription?.unsubscribe();
  }
}
