import { Component, effect, OnDestroy } from "@angular/core";
import { CartService } from "src/app/core/services/cart.service";
import { MatIconModule } from "@angular/material/icon";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CartItem } from "src/app/interfaces/cart-item.interface";
import { AuthService } from "src/app/core/services/auth.service";
import { User } from "firebase/auth";
import { Subscription } from "rxjs";
import { Order } from "src/app/interfaces/order.interface";
import { ApiService } from "src/app/api.service";
import { executeRecaptcha } from "src/app/utils/reCAPTCHA";
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

  constructor(public cartService: CartService, private toastr: ToastrService, private router: Router, private authService: AuthService, private api: ApiService) {
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

  redirectToItem(item: CartItem) {
    this.router.navigate(["/product", item.product.id]);
  }

  onSubmit() {
    if (!this.currentUser) {
      this.authService.loginWithGoogle();
      return;
    }

    const baseURL = window.location.origin;

    const cartItemList: CartItem[] = this.cartService.items().map((item) => {
      return {
        amount: item.amount,
        product: item.product,
        url: `${baseURL}/product/${item.product.id}`,
      };
    });

    const order: Order = {
      userId: this.currentUser.uid,
      cartItems: cartItemList,
      total: this.cartService.total(),
    };

    this.createOrder(baseURL, order);
  }

  createOrder(baseURL: string, order: Order) {
    executeRecaptcha("submit_order")
      .then((token) => {
        this.api.createOrder(order, token).subscribe({
          next: () => {
            this.cartService.clearCart();
            this.showToast("Pedido salvo com sucesso!", true);
            this.sendWhatsAppMessage(baseURL, order);
          },
          error: (err) => {
            console.error("Error creating order:", err);
            this.showToast("Erro ao enviar o pedido!");
          },
        });
      })
      .catch((error) => {
        console.error("reCAPTCHA error:", error);
        this.showToast("Falha na verificação de segurança. Tente novamente.");
      });
  }

  sendWhatsAppMessage(baseURL: string, order: Order) {
    let message = ` *Novo Pedido* \n\n`;
    message += `Link do pedido: ${baseURL}/orders/${this.currentUser.uid} \n\n`;
    order.cartItems.forEach((item) => {
      message += `*${item.product.name}*\n R$${(item.product.price - (item.product.price * item.product.discount) / 100).toFixed(2)} x ${item.amount}\n ${item.url}\n\n`;
    });
    message += ` *Total:* R$${order.total.toFixed(2)}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Recipient number
    const phoneNumber = "559581122871";

    // Open WhatsApp chat with formatted message
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  }

  showToast(message: string, type?: boolean) {
    if (type) {
      this.toastr.success(message, "", { timeOut: 3000 });
    } else {
      this.toastr.error(message, "", { timeOut: 3000 });
    }
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }
}
