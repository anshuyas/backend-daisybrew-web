export interface OrderItemDto {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  temperature?: string;
}

export interface CustomerDetailsDto {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateOrderDto {
  items: OrderItemDto[];
  total: number;
  deliveryOption: "delivery" | "pickup";
  timeOption: "asap" | "later";
  scheduledTime?: Date | null;
  paymentMethod: "cod";
  customerDetails: CustomerDetailsDto;
}

export interface UpdateOrderStatusDto {
  status: "confirmed" | "ready" | "out" | "delivered" | "cancelled";
}