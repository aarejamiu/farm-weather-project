const token = '';
const API_HOST = window.APP_CONFIG.apiHost;

const title = document.getElementById('paymentTitle');
const message = document.getElementById('paymentMessage');
const link = document.getElementById('paymentLink');
const reference = new URLSearchParams(window.location.search).get('reference');

const verify = async () => {
    if (!token || !reference) throw new Error('Payment reference is missing');

    const response = await fetch(`${API_HOST}/api/payments/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Payment could not be verified');

    await fetch(`${API_HOST}/api/cart/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    title.textContent = 'Payment successful';
    message.textContent = 'Your order has been created successfully.';
    link.hidden = false;
};

verify().catch(error => {
    title.textContent = 'Payment not completed';
    message.textContent = error.message;
    link.hidden = false;
});