const formatPrice = (value) => '₦' + Number(value).toLocaleString('en-NG');
const getCart = () => JSON.parse(localStorage.getItem('customerCart') || '[]');
const saveCart = (cart) => localStorage.setItem('customerCart', JSON.stringify(cart));

const renderCart = () => {
    const cart = getCart();
    const content = document.getElementById('cartContent');
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    badge.textContent = count || '';
    badge.style.display = count ? 'flex' : 'none';

    if (!cart.length) {
        content.innerHTML = `<section class="empty-cart"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><h2>Your cart is empty</h2><p>Add some fresh produce to get started</p><a href="shop.html">Browse Products</a></section>`;
        return;
    }

    const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
    content.innerHTML = `<div class="cart-layout"><section class="cart-items">${cart.map((item, index) => `<div class="cart-row"><div><div class="cart-item-name">${item.name}</div><div class="cart-item-meta">${formatPrice(item.price)} / ${item.unit || 'unit'}</div></div><div class="quantity-control"><button type="button" data-action="decrease" data-index="${index}">-</button><strong>${item.quantity}</strong><button type="button" data-action="increase" data-index="${index}">+</button></div><div class="cart-item-total">${formatPrice(Number(item.price) * Number(item.quantity))}<button class="remove-item" type="button" data-action="remove" data-index="${index}">Remove</button></div></div>`).join('')}</section><aside class="cart-summary"><h2>Order summary</h2><div class="summary-line"><span>Items</span><span>${count}</span></div><div class="summary-line summary-total"><span>Total</span><span>${formatPrice(subtotal)}</span></div><button class="checkout-btn" type="button" disabled>Checkout</button></aside></div>`;
};

document.getElementById('cartContent').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const cart = getCart();
    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    if (action === 'increase') cart[index].quantity++;
    if (action === 'decrease') cart[index].quantity--;
    if (action === 'remove' || cart[index]?.quantity <= 0) cart.splice(index, 1);
    saveCart(cart);
    renderCart();
});

renderCart();
