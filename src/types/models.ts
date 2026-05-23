export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export const LIMITS = {
  [SubscriptionPlan.FREE]: 20,
  [SubscriptionPlan.PREMIUM]: Infinity
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  plan: SubscriptionPlan;
  createdAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  description?: string;
  size?: string;
  color?: string;
  photos?: string[];
  sold?: boolean;
}

export interface Sale {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
}

export const canAddProduct = (currentProductCount: number, userPlan: SubscriptionPlan): boolean => {
  return currentProductCount < LIMITS[userPlan];
};
