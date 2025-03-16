import { Component, effect, OnDestroy } from "@angular/core";
import { CartService } from "src/app/core/services/cart.service";
import { MatIconModule } from "@angular/material/icon";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Cart } from "src/app/interfaces/cart.interface";
import { AuthService } from "src/app/core/services/auth.service";
import { User } from "firebase/auth";
import { Subscription } from "rxjs";
@Component({
  selector: "app-cart",
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: "./cart.component.html",
  styleUrl: "./cart.component.less",
})
export class CartComponent implements OnDestroy {
  currentUser: User | null = null;
  currentUserSubscription: Subscription;

  constructor(public cartService: CartService, private toastr: ToastrService, private router: Router, private authService: AuthService) {
    effect(() => {
      if (this.cartService.cartLimitReached()) {
        this.toastr.error("Você atingiu o limite máximo de items no carrinho.", "", {
          timeOut: 3000,
          newestOnTop: true, // fix multiple toasts stacking
        });
      }
    });
    this.currentUserSubscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user; // Update user state when auth state changes
    });
  }

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
  }

  redirectToItem(item: Cart) {
    this.router.navigate(["/product", item.product.id]);
  }

  onSubmit() {
    if (!this.currentUser) {
      this.authService.loginWithGoogle();
      return;
    }

    const baseURL = window.location.origin;
    const order = this.cartService.items().map((item) => {
      return {
        name: item.product.name,
        price: item.product.price,
        quantity: item.amount,
        url: `${baseURL}/product/${item.product.id}`,
        imageUrl: item.product.image, // Assuming each product has an 'image' property
      };
    });

    order["total"] = this.cartService.totalSum();

    // 📝 Format WhatsApp message
    let message = ` *Novo Pedido* \n\n`;
    order.forEach((item) => {
      message += `*${item.name}*\n R$${item.price.toFixed(2)} x ${item.quantity}\n ${item.url}\n ${item.imageUrl}\n\n`;
    });
    message += ` *Total:* R$${order["total"].toFixed(2)}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Replace with actual recipient number
    const phoneNumber = "559591618635";

    // Open WhatsApp chat with formatted message
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }
}
