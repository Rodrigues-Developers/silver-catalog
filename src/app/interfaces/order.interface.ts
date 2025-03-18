import { CartItem } from "./cart-item.interface";

export interface Order {
  id?: string;
  userId: string;
  cartItems: CartItem[];
  status?: string;
  createdAt?: Date;
  total: number;
}
