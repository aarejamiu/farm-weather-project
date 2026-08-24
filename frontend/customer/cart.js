const formatPrice = (value) => '₦' + Number(value).toLocaleString('en-NG');
const deliveryFee = 500;
const getCart = () => JSON.parse(localStorage.getItem('customerCart') || '[]');
const saveCart = (cart) => localStorage.setItem('customerCart', JSON.stringify(cart));

const renderCart = () => {
    const cart = getCart();
    const content = document.getElementById('cartContent');
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    document.getElementById('cartItemCount').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    badge.textContent = count || '';
    badge.style.display = count ? 'flex' : 'none';

    if (!cart.length) {
        content.innerHTML = `<section class="empty-cart"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><h2>Your cart is empty</h2><p>Add some fresh produce to get started</p><a href="shop.html">Browse Products</a></section>`;
        return;
    }

    const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
    const total = subtotal + deliveryFee;
    const images = JSON.parse(localStorage.getItem('productImages') || '{}');
    content.innerHTML = `<div class="cart-layout"><section class="cart-items">${cart.map((item, index) => {
        const image = item.image || images[item.id] || '';
        const imageHTML = image ? `<img src="${image}" alt="${item.name}">` : `<div class="cart-image-placeholder" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        return `<div class="cart-row"><div class="cart-item-image">${imageHTML}</div><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-meta">${formatPrice(item.price)} / ${item.unit || 'unit'}</div></div><div class="quantity-control"><button type="button" aria-label="Decrease ${item.name}" data-action="decrease" data-index="${index}">−</button><strong>${item.quantity}</strong><button type="button" aria-label="Increase ${item.name}" data-action="increase" data-index="${index}">+</button></div><div class="cart-item-total">${formatPrice(Number(item.price) * Number(item.quantity))}</div><button class="remove-item" type="button" aria-label="Remove ${item.name}" data-action="remove" data-index="${index}">⌫</button></div>`;
    }).join('')}</section><aside class="cart-summary"><h2>Order Summary</h2>${cart.map(item => `<div class="summary-line"><span>${item.name} × ${item.quantity}</span><span>${formatPrice(Number(item.price) * Number(item.quantity))}</span></div>`).join('')}<div class="summary-divider"></div><div class="summary-line"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div><div class="summary-line"><span>Delivery</span><span>${formatPrice(deliveryFee)}</span></div><div class="summary-line summary-total"><span>Total</span><span>${formatPrice(total)}</span></div><button class="checkout-btn" type="button"><span>▣</span> Place Order <span>→</span></button><a class="summary-shopping" href="shop.html">Continue Shopping</a><div class="fresh-note"><span>♨</span> All produce harvested within 24 hours</div></aside></div>`;
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
