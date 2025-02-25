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

  constructor(private api: ApiService, private router: Router, private filterService: FilterService) {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.productsList = res as Product[];
        this.applyFilters();
      },
      error: () => (this.hasApiError = true),
    });
  }

  ngOnInit(): void {
    this.filterService.minPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.maxPrice$.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.selectedCategories$.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() { // TODO: fix the number of requisitions when changing the price list.
    const minPrice = this.filterService.getMinPriceSubject().getValue();
    const maxPrice = this.filterService.getMaxPriceSubject().getValue();
    const selectedCategories = this.filterService.getSelectedCategoriesSubject().getValue();

    if (selectedCategories.length > 0) {
      this.api.getProductsByCategory(selectedCategories[0]).subscribe({
        next: (res) => {
          this.hasApiError = false;
          this.filteredProductsList = res as Product[];
          this.filteredProductsList = this.filteredProductsList.filter(product => product.price >= minPrice && product.price <= maxPrice);
        },
        error: () => (this.hasApiError = true),
      });
    } else {
      this.filteredProductsList = this.productsList.filter(product => product.price >= minPrice && product.price <= maxPrice);
    }
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }
}
