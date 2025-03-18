import { Product } from "./products.interface";

export interface CartItem {
  amount: number;
  url?: string;
  product: Product;
}
