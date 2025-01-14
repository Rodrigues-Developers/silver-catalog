import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CommonModule } from "@angular/common";
import { SideBarComponent } from "../shared/side-bar/side-bar.component";
import { ProductListComponent } from "../product-list/product-list.component";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.less"],
  standalone: true,
  imports: [CommonModule, SideBarComponent, ProductListComponent],
})
export class ProductDetailsComponent implements OnInit {
  productId: string | null = null;
  product: Product;
  images: string[] = [];
  additionalImages: string[] = [];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get("id");
    this.api.getProduct(this.productId).subscribe({
      next: (res) => {
        this.product = res;
        this.additionalImages = [...this.additionalImages, this.product.image];
        this.additionalImages = [...this.additionalImages, this.product.image];
        this.additionalImages = [...this.additionalImages, this.product.image];
      },
      error: () => console.error("Error fetching product details"),
    });
  }
}
