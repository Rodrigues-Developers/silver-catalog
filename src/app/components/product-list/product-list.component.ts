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
        this.filteredProductsList = this.productsList;
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

  applyFilters() {
    const minPrice = this.filterService.getMinPriceSubject().getValue();
    const maxPrice = this.filterService.getMaxPriceSubject().getValue();
    const selectedCategories = this.filterService.getSelectedCategoriesSubject().getValue();

    this.filteredProductsList = this.productsList.filter((product) => {
      const isWithinPriceRange = product.price >= minPrice && product.price <= maxPrice;
      const isInSelectedCategories = selectedCategories.length === 0 || selectedCategories.some(category => product.category.includes(category));
      return isWithinPriceRange && isInSelectedCategories;
    });
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }
}
