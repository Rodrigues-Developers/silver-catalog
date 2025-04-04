import { Component, OnInit, ElementRef, HostListener } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { User } from "firebase/auth"; // Import User type from Firebase
import { MatIconModule } from "@angular/material/icon"; // Import MatIconModule
import { NgIf } from "@angular/common"; // Import NgIf for structural directives
import { RouterLink } from "@angular/router";
import { CartService } from "src/app/core/services/cart.service";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.less"],
  standalone: true,
  imports: [MatIconModule, NgIf, RouterLink], // Import necessary modules
})
export class NavBarComponent implements OnInit {
  isCollapsed = true;
  userCollapsed = true;
  user: User | null = null; // Start user as null to reflect auth state properly
  isUserAdmin = false; // Default to false

  constructor(private authService: AuthService, private eRef: ElementRef, public cartService: CartService) {}

  ngOnInit(): void {
    // Directly subscribe to user from AuthService using signal
    this.authService.user$.subscribe((user) => {
      this.user = user; // Update user state when auth state changes
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          this.isUserAdmin = idTokenResult.claims["role"] === "admin"; // Check if user is admin
        });
      }
    });
  }

  /**
   * @name clickout
   * @description Click listener for document to close dropdowns when clicking outside.
   * @param event
   */
  @HostListener("document:click", ["$event"])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isCollapsed = true;
      this.userCollapsed = true;
    }
  }

  loginWithRedirect() {
    this.authService.loginWithGoogle(); // Handle login with Google redirect
  }

  loginWithPopup() {
    this.authService.loginWithGoogle(); // Handle login with Google popup
  }

  logout() {
    this.authService.logout(); // Handle logout
  }

  get isAuthenticated(): boolean {
    return this.user !== null; // Return true if user is not null
  }

  toggleCart() {
    this.cartService.toggleCart();
  }
}
