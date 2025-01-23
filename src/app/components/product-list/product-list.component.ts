import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";
import { Router } from "@angular/router";
import { FilterComponent } from "src/app/shared/filter/filter.component";

@Component({
  selector: "app-product-list",
  imports: [CommonModule, CapitalizePipe, FilterComponent],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.less",
  standalone: true,
})
export class ProductListComponent {
  hasApiError = false;
  productsList: Product[];

  constructor(private api: ApiService, private router: Router) {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.productsList = res as Product[];
        //duplicate product lsit
        // this.productsList = [...this.productsList, ...this.productsList];
      },
      error: () => (this.hasApiError = true),
    });
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }
}
