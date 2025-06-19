import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { User } from "firebase/auth"; // Import User type from Firebase
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { FilterService } from "src/app/core/services/filter.service";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";

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
  baseMinPrice = 0; // Absolute minimum
  baseMaxPrice = 3000; // Absolute maximum
  minPrice = 0; // Dynamic minimum value
  maxPrice = 3000; // Dynamic maximum value
  priceGap = 100; // Minimum gap between minPrice and maxPrice
  categories: any[] = [];
  selectedCategory: string | null = null;
  searchQuery = new FormControl("");
  private absolutePriceInputTimeout: any;

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
    const countRequests = this.categories.map((category) => this.apiService.getProductCountByCategory(category.id).pipe(map((count) => ({ id: category.id, count }))));

    forkJoin(countRequests).subscribe((counts) => {
      counts.forEach((count) => {
        const category = this.categories.find((cat) => cat.id === count.id);
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

  onAbsolutePriceChange(type: "min" | "max", rawValue: string): void {
    let value = Number(rawValue);

    if (isNaN(value)) return;

    // Clamp value manually
    if (type === "min") {
      const maxAllowed = this.baseMaxPrice - 1;
      value = Math.max(0, Math.min(maxAllowed, value));
      this.baseMinPrice = value;
      this.minPrice = value;
    } else {
      const minAllowed = this.baseMinPrice + 1;
      value = Math.max(minAllowed, Math.min(3000, value));
      this.baseMaxPrice = value;
      this.maxPrice = value;
    }

    // Update price gap and trigger any related updates
    this.priceGap = Math.round((this.maxPrice - this.minPrice) * 0.05);
    this.onPriceChangeEnd();

    // Push corrected value back into the input (optional but recommended)
    // This syncs the UI if the user typed something outside the allowed range
    // Debounce UI update
    if (this.absolutePriceInputTimeout) {
      clearTimeout(this.absolutePriceInputTimeout);
    }
    this.absolutePriceInputTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        const inputEl = document.activeElement as HTMLInputElement;
        if (inputEl) {
          inputEl.value = value.toString();
        }
      });
    }, 2200);
  }

  blockTooManyDigits(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Allow control keys (Backspace, Delete, Arrow keys, etc.)
    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (allowedKeys.includes(event.key)) return;

    // Block if current input is already 4 digits and user is typing a new number
    const currentValue = input.value;
    if (currentValue.length >= 4 && !window.getSelection()?.toString()) {
      event.preventDefault();
    }
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
