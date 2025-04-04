import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { User } from "firebase/auth"; // Import User type from Firebase
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { FilterService } from "src/app/core/services/filter.service";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: "app-side-bar",
  templateUrl: "./side-bar.component.html",
  styleUrls: ["./side-bar.component.less"],
  standalone: true,
  imports: [MatIconModule, CommonModule, ReactiveFormsModule], // Import required modules
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
  baseMaxPrice = 10000; // Absolute maximum
  minPrice = 50; // Dynamic minimum value
  maxPrice = 10000; // Dynamic maximum value
  priceGap = 200; // Minimum gap between minPrice and maxPrice
  categories: any[] = [];
  selectedCategory: string | null = null;
  searchQuery = new FormControl("");

  constructor(private authService: AuthService, private filterService: FilterService, private apiService: ApiService) {}

  ngOnInit(): void {
    // Access the user signal from AuthService, subscribing to changes in user state
    this.authService.user$.subscribe((user) => {
      this.user = user; // Set user when auth state changes
    });

    this.apiService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.loadProductCounts();
    });
  }

  loadProductCounts(): void {
    const countRequests = this.categories.map(category => 
      this.apiService.getProductCountByCategory(category.id).pipe(
        map(count => ({ id: category.id, count }))
      )
    );

    forkJoin(countRequests).subscribe(counts => {
      counts.forEach(count => {
        const category = this.categories.find(cat => cat.id === count.id);
        if (category) {
          category.amount = count.count;
        }
      });
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
  }

  onPriceChangeEnd(): void {
    this.filterService.setMinPrice(this.minPrice);
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

  onSearchClick() {
    this.filterService.setSearchQuery(this.searchQuery.value);
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default action
      event.stopPropagation(); // Stop propagation
      this.onSearchClick();
    }
  }
}
