import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupan,
} from "../controllers/payment.js";

const app = express.Router();

app.post("/create", createPaymentIntent)

// Route - /api/v1/payment/discount
app.get("/discount", applyDiscount);

// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupan);

// Route - /api/v1/payment/coupan/all
app.get("/coupon/all", adminOnly, allCoupons);

// Route - /api/v1/payment/coupan/:id
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
