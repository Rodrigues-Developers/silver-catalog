import { computed, Injectable, signal } from "@angular/core";
import { Product } from "src/app/interfaces/products.interface";
import { Cart } from "src/app/interfaces/cart.interface"; // Import the new Cart interface

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartItems = signal<Cart[]>([]);
  private showCart = signal(false);
  private maxItems = 30;
  private maxAmountPerProduct = 10; // Max quantity per product
  cartLimitReached = signal(false);

  totalSum = computed(() => this.cartItems().reduce((acc, item) => acc + item.product.price * item.amount, 0));

  get items() {
    return this.cartItems;
  }

  addToCart(product: Product) {
    const existingItemIndex = this.cartItems().findIndex((item) => item.product.id === product.id);

    if (existingItemIndex !== -1) {
      // If product exists, check max amount before increasing
      const updatedItems = [...this.cartItems()];
      if (updatedItems[existingItemIndex].amount < this.maxAmountPerProduct) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          amount: updatedItems[existingItemIndex].amount + 1,
        };
        this.cartItems.set(updatedItems);
      }
    } else {
      // Add new product with amount 1
      if (this.cartItems().length >= this.maxItems) {
        if (!this.cartLimitReached()) {
          this.cartLimitReached.set(true);
          setTimeout(() => this.cartLimitReached.set(false), 3500);
        }
        return;
      }
      this.cartItems.set([...this.cartItems(), { product, amount: 1 }]);
    }
  }

  removeFromCart(index: number) {
    const updatedItems = this.cartItems().filter((_, i) => i !== index);
    this.cartItems.set(updatedItems);
  }

  increaseAmount(index: number) {
    const updatedItems = [...this.cartItems()];
    if (updatedItems[index].amount < this.maxAmountPerProduct) {
      updatedItems[index].amount++;
      this.cartItems.set(updatedItems);
    }
  }

  decreaseAmount(index: number) {
    const updatedItems = [...this.cartItems()];
    if (updatedItems[index].amount > 1) {
      updatedItems[index].amount--;
    } else {
      updatedItems[index].amount = 1; // Set to 1 if amount is 0
    }
    this.cartItems.set(updatedItems);
  }

  get isCartVisible() {
    return this.showCart;
  }

  get total() {
    return this.totalSum;
  }

  toggleCart() {
    this.showCart.set(!this.showCart());
  }

  resetCartLimitWarning() {
    this.cartLimitReached.set(false);
  }
}
