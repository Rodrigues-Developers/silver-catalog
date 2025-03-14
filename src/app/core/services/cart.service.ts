import { Injectable, signal } from "@angular/core";
import { Product } from "src/app/interfaces/products.interface";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartItems = signal<Product[]>([]);
  private showCart = signal(false); // <-- Add this signal

  get items() {
    return this.cartItems;
  }

  addToCart(product: Product) {
    this.cartItems.set([...this.cartItems(), product]); // Update signal
  }

  removeFromCart(index: number) {
    const updatedItems = this.cartItems().filter((_, i) => i !== index);
    this.cartItems.set(updatedItems);
  }

  get isCartVisible() {
    return this.showCart;
  }

  toggleCart() {
    this.showCart.set(!this.showCart());
  }
}
