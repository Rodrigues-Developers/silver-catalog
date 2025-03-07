import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/api.service";
import { FilterService } from "src/app/core/services/filter.service";
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
export class ProductDetailsComponent implements OnInit, OnDestroy {
  productId: string | null = null;
  product: Product;
  images: string[] = [];
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get("id");
    this.api.getProduct(this.productId).subscribe({
      next: (res) => {
        this.product = res;
      },
      error: () => console.error("Error fetching product details"),
    });
  }

  ngOnDestroy(): void {
    this.filterService.resetFilters();
  }

  navigateToProductDetails(product: Product) {
    this.router.navigate(["/product", product.id]);
  }

  swapImage(image: string) {
    if (this.selectedImage === image) {
      this.selectedImage = null;
    } else {
      const mainImage = document.querySelector(".main-image") as HTMLElement;
      if (mainImage) {
        mainImage.classList.add("fading");
        setTimeout(() => {
          this.selectedImage = image;
          mainImage.classList.remove("fading");
        }, 250);
      } else {
        this.selectedImage = image;
      }
    }
  }
}
