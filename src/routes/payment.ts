import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupan,
} from "../controllers/payment.js";
import { screenshortUpload } from "../middlewares/multer.js";

const app = express.Router();

app.post("/create", screenshortUpload, createPaymentIntent)

// Route - /api/v1/payment/discount
app.get("/discount", applyDiscount);

// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupan);

// Route - /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, allCoupons);

// Route - /api/v1/payment/coupon/:id
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
