import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

interface MulterFile extends Express.Multer.File {
  firebaseUrl?: string;
}

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (req.file) {
    const file = req.file as MulterFile;
    const fileUrl = file?.firebaseUrl
    console.log("File uploaded:", file);
    console.log("Firebase URL:", file?.firebaseUrl);
    return res.status(201).json({
      success: true,
      paymentMethod: "ONLINE",
      screenshortUrl: file?.firebaseUrl
    });
  }

  if (!amount) return next(new ErrorHandler("Please provide all required fields", 400));

  return res.status(201).json({
    success: true,
    paymentMethod: "COD",
  });
});

export const newCoupan = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 400));

  await Coupon.create({ code: coupon, amount });

  return res.status(201).json({
    success: true,
    message: `Coupon Created Sucesfully`,
    coupon
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find();

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupan = await Coupon.findByIdAndDelete(id);

  if (!coupan) return next(new ErrorHandler("Invalid coupon ID", 400));

  return res.status(200).json({
    success: true,
    message: `Coupan ${coupan?.code} Deleted Successfully`,
  });
});
