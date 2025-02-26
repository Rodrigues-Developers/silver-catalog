import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { User } from "firebase/auth";
import { CommonModule } from "@angular/common";
import { LoadingComponent } from "../../components/shared/loading/loading.component";
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { MainBannerComponent } from "../../components/main-banner/main-banner.component";
import { firstValueFrom } from "rxjs"; // For async-await observable handling
import { DynamicTextComponent } from "src/app/components/dynamic-text/dynamic-text.component";
import { CategoryListComponent } from "../../components/category-list/category-list.component";
import { HorizontalSliderComponent } from "../../components/horizontal-slider/horizontal-slider.component";
import { ApiService } from "src/app/api.service";
import { Banner } from "src/app/interfaces/banner.interface";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.less"],
  standalone: true,
  imports: [CommonModule, LoadingComponent, MainBannerComponent, ProductListComponent, DynamicTextComponent, CategoryListComponent, HorizontalSliderComponent],
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  hasApiError = false;
  bannerList: Banner[] = [];
  constructor(private authService: AuthService, private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Wait for the user data to be fetched
      this.user = await firstValueFrom(this.authService.user$);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      this.isLoading = false;
    }

    this.fetchBanners();
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
}
