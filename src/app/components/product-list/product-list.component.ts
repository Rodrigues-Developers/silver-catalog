import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.less",
})
export class ProductListComponent {
  products = [
    { name: "Product 1", description: "Great product", price: 99.99 },
    { name: "Product 2", description: "Amazing product", price: 79.99 },
    { name: "Product 3", description: "Fantastic product", price: 49.99 },
    { name: "Product 4", description: "Awesome product", price: 119.99 },
    { name: "Product 5", description: "Excellent product", price: 29.99 },
  ];

  hasApiError = false;
  productsList: Product[];

  constructor(private api: ApiService) {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.productsList = res as Product[];
      },
      error: () => (this.hasApiError = true),
    });
  }

  createProduct() {
    //Example of a hardcoded product
    const newProduct: Product = {
      name: "Pulseira",
      description: "Great bracelet",
      price: 180.5,
      availability: true,
      category: ["bracelet"],
      image: "https://example.com/image.jpg",
    };

    this.api.createProduct(newProduct).subscribe({
      next: (product) => console.log("Product Created:", product),
      error: (err) => console.error("Error creating product:", err),
    });
  }
}
