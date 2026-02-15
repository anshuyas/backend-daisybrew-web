export interface CreateMenuItemDto {
  name: string;
  price: number;
  image: string;
  category: "Coffee" | "Matcha" | "Smoothies" | "Bubble Tea" | "Tea";
}

export interface UpdateMenuItemDto {
  name?: string;
  price?: number;
  image?: string;
  category?: "Coffee" | "Matcha" | "Smoothies" | "Bubble Tea" | "Tea";
}
