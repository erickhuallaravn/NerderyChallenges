export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  store: string;
  addedAt: string;
}
