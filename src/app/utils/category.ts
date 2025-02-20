import { Category } from "../interfaces/category.interface";

export function getCategory(categoryId: string, categories: Category[]): Category {
  return categories.find((c) => c.id === categoryId);
}
