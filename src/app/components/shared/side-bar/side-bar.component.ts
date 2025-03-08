import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { User } from "firebase/auth"; // Import User type from Firebase
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { FilterService } from "src/app/core/services/filter.service";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";

@Component({
  selector: "app-side-bar",
  templateUrl: "./side-bar.component.html",
  styleUrls: ["./side-bar.component.less"],
  standalone: true,
  imports: [MatIconModule, CommonModule], // Import required modules
})
export class SideBarComponent implements OnInit {
  private _selectedItem: Category | null = null;
  @Output() searchInput = new EventEmitter<string>();
  @Output() searchClick = new EventEmitter<string>();
  @Input()
  set selectedItem(value: Category | null) {
    this._selectedItem = value;
    this.onCategoryClick(value?.id || "");
  }

  isCollapsed = true;
  user: User | null = null; // Default user to null to reflect unauthenticated state
  baseMinPrice = 50; // Absolute minimum
  baseMaxPrice = 2500; // Absolute maximum
  minPrice = 50; // Dynamic minimum value
  maxPrice = 2500; // Dynamic maximum value
  priceGap = 200; // Minimum gap between minPrice and maxPrice
  categories: any[] = [];
  selectedCategory: string | null = null;
  searchQuery = "";

  constructor(private authService: AuthService, private filterService: FilterService, private apiService: ApiService) {}

  ngOnInit(): void {
    // Access the user signal from AuthService, subscribing to changes in user state
    this.authService.user$.subscribe((user) => {
      this.user = user; // Set user when auth state changes
    });

    this.apiService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  onCategoryClick(categoryId: string): void {
    if (this.selectedCategory === categoryId) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = categoryId;
    }
    this.filterService.setSelectedCategories(this.selectedCategory ? [this.selectedCategory] : []);
  }

  onMinPriceChange(event: Event): void {
    const newMin = +(event.target as HTMLInputElement).value;
    if (newMin + this.priceGap <= this.maxPrice) {
      this.minPrice = newMin;
    } else {
      this.minPrice = this.maxPrice - this.priceGap;
      // Force the slider back if it overlaps
      (event.target as HTMLInputElement).value = this.minPrice.toString();
    }
    this.filterService.setMinPrice(this.minPrice);
  }

  // Handler for max price slider
  onMaxPriceChange(event: Event): void {
    const newMax = +(event.target as HTMLInputElement).value;
    if (newMax >= this.minPrice + this.priceGap) {
      this.maxPrice = newMax;
    } else {
      this.maxPrice = this.minPrice + this.priceGap;
      // Force the slider back if it overlaps
      (event.target as HTMLInputElement).value = this.maxPrice.toString();
    }
    this.filterService.setMaxPrice(this.maxPrice);
  }

  // Login method using the AuthService's Google login
  loginWithRedirect() {
    this.authService.loginWithGoogle(); // Redirect login method
  }

  // Logout method using the AuthService's logout functionality
  logout() {
    this.authService.logout(); // Logout method
  }

  // Check if the user is authenticated by checking if user is not null
  get isAuthenticated(): boolean {
    return this.user !== null; // True if user is logged in (user exists)
  }

  onSearchInput(value: string) {
    this.searchQuery = value;
    this.filterService.setSearchQuery(value);
  }

  onSearchClick() {
    this.filterService.setSearchQuery(this.searchQuery);
  }
}
