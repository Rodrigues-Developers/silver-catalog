export interface Product {
  id?: string;
  name: string;
  description?: string;
  availability: boolean;
  price: number;
  category: string[];
  image: string;
}
