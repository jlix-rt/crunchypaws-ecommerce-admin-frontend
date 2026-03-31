export type StaffRole = 'ADMIN' | 'SELLER' | 'COLLABORATOR';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  alias: string | null;
  freeShipping: boolean;
  isVerified: boolean;
  createdAt?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
  parentId: string | null;
  children: CategoryNode[];
}

export interface ProductListItem {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  /** Si es false, no se controla inventario en tienda (cantidad ilimitada). */
  tracksStock: boolean;
  categoryId: string;
  sku: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  isPopular: boolean;
  category: { id: string; name: string; slug: string };
  images: { id: string; imageUrl: string; sortOrder?: number }[];
}

export type OrderAdminActionType = 'REJECT' | 'PREPARE' | 'SHIP' | 'FINALIZE';

/** Flujo de pago asociado a estados/transiciones (anticipado vs contra entrega). */
export type OrderPaymentFlowType = 'ADVANCE' | 'COD' | 'SHARED';

export interface OrderStatusDefinitionDto {
  id: string;
  code: string;
  labelAdmin: string;
  labelCustomer: string;
  sortOrder: number;
  isInitial: boolean;
  allowsProofUpload: boolean;
  isCancelled: boolean;
  isTerminal: boolean;
  paymentFlow?: OrderPaymentFlowType | null;
}

export interface OrderStatusTransitionDto {
  id: string;
  fromStatusId: string;
  action: OrderAdminActionType;
  toStatusId: string;
  paymentFlow: OrderPaymentFlowType;
  fromStatus: { id: string; code: string; labelAdmin: string };
  toStatus: { id: string; code: string; labelAdmin: string };
}

export interface OrderAdminListItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  total: string | number;
  recipientName: string;
  recipientPhone: string;
  status: OrderStatusDefinitionDto;
  user: { id: string; email: string; fullName: string } | null;
}
