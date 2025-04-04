export interface Product {
  id?: string;
  name: string;
  description?: string;
  availability: boolean;
  price: number;
  category: string[];
  image: string;
  additionalImages?: string[];
}

export interface TopProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  availability: boolean;
  totalSold: number;
}
