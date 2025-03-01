import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";
import { Router } from "@angular/router";
import { FilterService } from "src/app/core/services/filter.service";

@Component({
  selector: "app-product-list",
  imports: [CommonModule, CapitalizePipe],
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.less"],
  standalone: true,
})
export class ProductListComponent implements OnInit {
  hasApiError = false;
  productsList: Product[] = [];
  filteredProductsList: Product[] = [];

  constructor(private api: ApiService, private router: Router, private filterService: FilterService) {}

  ngOnInit(): void {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.productsList = res as Product[];
        this.applyFilters();
      },
      error: () => (this.hasApiError = true),
    });

    this.filterService.minPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.maxPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.selectedCategories$.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.searchQuery$.subscribe((query) => {
      this.onSearchInput(query);
    });
  }

  applyFilters() {
    if (this.productsList.length === 0) {
      return;
    }

    const minPrice = this.filterService.getMinPriceSubject().getValue();
    const maxPrice = this.filterService.getMaxPriceSubject().getValue();
    const selectedCategories = this.filterService.getSelectedCategoriesSubject().getValue();

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

  onSearchInput(value: string) {
    if (value.trim() === "") {
      this.applyFilters();
    } else {
      this.filteredProductsList = this.productsList.filter((product) => product.name.toLowerCase().includes(value.toLowerCase()));
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
}
