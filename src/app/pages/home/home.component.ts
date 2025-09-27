import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { User } from "firebase/auth";
import { CommonModule } from "@angular/common";
import { LoadingComponent } from "../../components/shared/loading/loading.component";
import { firstValueFrom } from "rxjs"; // For async-await observable handling
import { DynamicTextComponent } from "src/app/components/dynamic-text/dynamic-text.component";
import { CategoryListComponent } from "../../components/category-list/category-list.component";
import { HorizontalSliderComponent } from "../../components/horizontal-slider/horizontal-slider.component";
import { ApiService } from "src/app/api.service";
import { Banner } from "src/app/interfaces/banner.interface";
import { Router } from "@angular/router";
import { Product, TopProduct } from "src/app/interfaces/products.interface";
import { ItemListComponent } from "src/app/components/item-list/item-list.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.less"],
  standalone: true,
  imports: [CommonModule, LoadingComponent, DynamicTextComponent, CategoryListComponent, HorizontalSliderComponent, ItemListComponent],
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  loading = true;
  hasApiError = false;
  bannerList: Banner[] = [];
  topProducts: TopProduct[] = [];
  discountedProducts: Product[] = [];
  constructor(private authService: AuthService, private api: ApiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      this.user = await firstValueFrom(this.authService.user$);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    this.fetchBanners();
    this.fetchProductData();
  }

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  fetchBanners(): void {
    this.api.getBanners().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.bannerList = res as Banner[];
      },
      error: () => (this.hasApiError = true),
    });
  }

  onBannerClick(banner: Banner): void {
    //remove the domain from the link
    const adaptedLink = banner.link?.replace(/^https?:\/\/[^/]+\//, "");
    if (adaptedLink) this.router.navigate([adaptedLink]);
  }

  async fetchTopProducts(): Promise<void> {
    return firstValueFrom(this.api.getTopSellers({ limit: 10 }))
      .then((res) => {
        this.hasApiError = false;
        this.topProducts = res as TopProduct[];
      })
      .catch(() => {
        this.hasApiError = true;
      });
  }

  async fetchDiscountedProducts(): Promise<void> {
    return firstValueFrom(this.api.getProducts({ sortBy: "discount", limit: 10 }))
      .then((res) => {
        this.hasApiError = false;
        this.discountedProducts = res as Product[];
      })
      .catch(() => {
        this.hasApiError = true;
      });
  }
  onTopProductClick(product: TopProduct): void {
    this.router.navigate([`/product/${product._id}`]);
  }

  onDiscountClick(product: Product): void {
    this.router.navigate([`/product/${product.id}`]);
  }

  updateDiscount(): void {
    const discountMap = new Map(this.discountedProducts.map((product) => [product.id, product.discount]));

    this.topProducts.forEach((topProduct) => {
      const discount = discountMap.get(topProduct._id);
      if (discount !== undefined) {
        topProduct.discount = discount;
      }
    });
    this.loading = false;
  }

  fetchProductData(): void {
    const requests = [];
    requests.push(this.fetchDiscountedProducts());
    requests.push(this.fetchTopProducts());
    Promise.all(requests).then(() => {
      this.updateDiscount();
    });
  }
}
