import { Component, effect } from "@angular/core";
import { CartService } from "src/app/core/services/cart.service";
import { MatIconModule } from "@angular/material/icon";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Cart } from "src/app/interfaces/cart.interface";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: "./cart.component.html",
  styleUrl: "./cart.component.less",
})
export class CartComponent {
  constructor(public cartService: CartService, private toastr: ToastrService, private router: Router) {
    effect(() => {
      if (this.cartService.cartLimitReached()) {
        this.toastr.error("Você atingiu o limite máximo de items no carrinho.", "", {
          timeOut: 3000,
          newestOnTop: true, // fix multiple toasts stacking
        });
      }
    });
  }

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
  }

  redirectToItem(item: Cart) {
    this.router.navigate(["/product", item.product.id]);
  }
}
