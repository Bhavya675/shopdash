export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}
