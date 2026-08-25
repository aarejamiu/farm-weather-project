# Paystack payment setup

The checkout flow uses Paystack:

1. The customer clicks `Pay & Place Order`.
2. The backend validates the products and stock.
3. Paystack hosts the payment page.
4. The callback verifies the transaction on the backend.
5. Only a verified payment creates the order.

## Local setup

1. Create or log in to a Paystack account at https://dashboard.paystack.com.
2. Open **Settings > API Keys & Webhooks**.
3. Copy the **Test Secret Key** while developing. It starts with `sk_test_`.
4. Add it to the root `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_your_real_key_here
```

5. Start the backend from the repository root:

```powershell
node index.js
```

6. Open the frontend through Live Server at `http://127.0.0.1:5500`.

Paystack will return to the local callback page:
`frontend/customer/payment-callback.html`.

## Render setup

In the Render service that runs the backend, add this environment variable under **Environment**:

```text
PAYSTACK_SECRET_KEY=sk_live_your_real_key_here
```

Use the live secret only after Paystack account activation and live-mode verification. Redeploy the service after saving the variable.

The frontend must be served from the deployed URL so the callback URL points to the deployed `payment-callback.html` page. The backend verifies the payment using the secret key; never put this key in frontend JavaScript.

## Testing

Use Paystack test mode and a Paystack-provided test card. Do not use a real card with a test key. Confirm that:

- a successful payment redirects to My Orders;
- an unsuccessful or cancelled payment leaves the cart unchanged;
- the order appears only after backend verification.

If checkout shows `Payment service is not configured`, `PAYSTACK_SECRET_KEY` is missing from the environment used by the running backend.
