import { Component } from "@angular/core";
import { CartService } from "src/app/core/services/cart.service";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [MatIconModule],
  templateUrl: "./cart.component.html",
  styleUrl: "./cart.component.less",
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
  }
}
