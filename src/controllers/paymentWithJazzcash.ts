import express from 'express';
import axios from 'axios';
import crypto from 'crypto';  // For generating secure hash if required by JazzCash

const router = express.Router();

router.post("/payment/jazzcash", async (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;
  console.log(amount)


  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  const merchantID = "XXXXXX"; // Your JazzCash Merchant ID
  const password = "XXXXXXXX"; // Your JazzCash Password
  const returnURL = "https://yourdomain.com/payment/callback"; // Callback URL after payment
  const txnRefNo = `${Date.now()}`; // Unique transaction reference number
  const txnDateTime = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Transaction date and time
  const hashKey = "XXXXXXXX"; // Your JazzCash Secure Hash Key

  const paymentData = {
    PP_Version: '1.1',
    PP_TxnType: 'MWALLET',
    PP_Language: 'EN',
    PP_MerchantID: merchantID,
    PP_Password: password,
    PP_Amount: amount,  // Convert to paisa
    PP_TxnRefNo: txnRefNo,
    PP_TxnCurrency: 'PKR',
    PP_TxnDateTime: txnDateTime,
    PP_BillReference: 'billRef123',
    PP_Description: 'Payment for order',
    PP_CustomerCardNumber: cardNumber,
    PP_CustomerCardExpiry: expiry,
    PP_CustomerCardCvv: cvv,
    PP_ReturnURL: returnURL,
    PP_SecureHash: ""
  };

  const sortedData = Object.values(paymentData).join('&'); // Ensure this is correct
  paymentData.PP_SecureHash = crypto.createHmac('sha256', hashKey).update(sortedData).digest('hex');

  try {
    const response = await axios.post(
      'https://sandbox.jazzcash.com.pk/CustomerPortal/API/Payment', 
      paymentData
    );

    if (response.data.success) {
      return res.status(200).json({ success: true, message: "Payment successful", data: response.data });
    } else {
      return res.status(400).json({ success: false, message: "Payment failed", data: response.data });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
