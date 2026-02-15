export type Category =
  | "Coffee"
  | "Matcha"
  | "Smoothies"
  | "Bubble Tea"
  | "Tea";

export interface MenuItem {
  _id?: string;
  name: string;
  price: number;
  image: string;
  category: Category;   
  isAvailable?: boolean; 
}
