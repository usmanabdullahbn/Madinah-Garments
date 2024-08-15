import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}

export interface NewProductRequestBody {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface BaseQuerry {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string | undefined;
}

export type invalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];

};

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};

export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  phoneNumber: number;
};

export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}
type PaymentData =  {
  pp_Version: string;
  pp_TxnType: string;
  pp_Language: string;
  pp_MerchantID: string;
  pp_Password: string;
  pp_Amount: string;
  pp_TxnRefNo: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_CustomerCardNumber: string;
  pp_CustomerCardExpiry: string;
  pp_CustomerCardCvv: string;
  pp_ReturnURL: string;
  pp_SecureHash: string;  // Add this line
};

