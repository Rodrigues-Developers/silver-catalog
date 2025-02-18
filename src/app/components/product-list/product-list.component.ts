import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";
import { Router } from "@angular/router";
import { FilterService } from 'src/app/services/filter.service';

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
        //duplicate product list
        // this.productsList = [...this.productsList, ...this.productsList];
        this.filteredProductsList = this.productsList;
      },
      error: () => (this.hasApiError = true),
    });
  }

  ngOnInit(): void {
    this.filterService.minPrice$.subscribe(minPrice => {
      this.applyFilters();
    });

    this.filterService.maxPrice$.subscribe(maxPrice => {
      this.applyFilters();
    });
  }

  applyFilters() {
    const minPrice = this.filterService.getMinPriceSubject().getValue();
    const maxPrice = this.filterService.getMaxPriceSubject().getValue();

    this.filteredProductsList = this.productsList.filter(product => {
      return product.price >= minPrice && product.price <= maxPrice;
    });
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }
}
