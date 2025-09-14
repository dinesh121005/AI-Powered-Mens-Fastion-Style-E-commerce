# Replace PayPal with Razorpay API Integration

## Backend Changes
- [ ] Remove paypal-rest-sdk dependency from server/package.json
- [ ] Install razorpay npm package
- [ ] Replace server/helpers/paypal.js with razorpay.js helper
- [ ] Update server/controllers/shop/order-controller.js to use Razorpay for order creation
- [ ] Update capturePayment function to verify Razorpay payment
- [ ] Update environment variables to use Razorpay keys instead of PayPal

## Frontend Changes
- [ ] Identify and update payment-related frontend files (e.g., paypal-return.jsx, checkout.jsx)
- [ ] Replace PayPal checkout with Razorpay checkout integration
- [ ] Update payment success/failure handling

## Testing
- [ ] Test order creation with Razorpay
- [ ] Test payment capture and order confirmation
- [ ] Verify stock updates and cart deletion after successful payment
- [ ] Test error handling for failed payments

## Environment Setup
- [ ] Update .env file with Razorpay API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
- [ ] Remove PayPal environment variables
