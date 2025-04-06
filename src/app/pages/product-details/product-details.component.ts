import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { ApiService } from "src/app/api.service";
import { FilterService } from "src/app/core/services/filter.service";
import { Product } from "src/app/interfaces/products.interface";
import { CommonModule } from "@angular/common";
import { SideBarComponent } from "../../components/shared/side-bar/side-bar.component";
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { CartService } from "src/app/core/services/cart.service";
import { filter, Subscription } from "rxjs";
import { LoadingComponent } from "../../components/shared/loading/loading.component";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.less"],
  standalone: true,
  imports: [CommonModule, SideBarComponent, ProductListComponent, LoadingComponent, MatIcon],
})
export class ProductDetailsComponent implements OnDestroy {
  productId: string | null = null;
  product: Product | null = null;
  images: string[] = [];
  selectedImage: string | null = null;
  private routeSub: Subscription;
  loading = true;
  showFilter = false;

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router, private cartService: CartService, private filterService: FilterService) {
    // Reload the product when the route changes withing the same route but different id
    this.routeSub = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.loadProduct();
    });

    this.loadProduct();
  }

  private loadProduct() {
    const productId = this.route.snapshot.paramMap.get("id");
    if (!productId) return;

    this.api.getProduct(productId).subscribe({
      next: (res) => {
        this.product = res;
        this.selectedImage = null;
        this.loading = false;
        window.scrollTo(0, 0);
      },
      error: () => console.error("Error fetching product details"),
    });
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

  addToCart() {
    if (this.product) {
      if (!this.cartService.isCartVisible()) {
        this.cartService.toggleCart();
      }
      this.cartService.addToCart(this.product);
    }
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.filterService.resetFilters();
  }
}
