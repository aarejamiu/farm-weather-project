const token = localStorage.getItem('token');
const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;

const formatPrice = value => '₦' + Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
const formatDate = value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const getCartCount = () => JSON.parse(localStorage.getItem('customerCart') || '[]').reduce((sum, item) => sum + Number(item.quantity || 0), 0);

const updateAvatar = async () => {
    try {
        const response = await fetch(`${BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const user = await response.json();
        document.getElementById('navAvatar').textContent = user.username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    } catch (error) { console.error('Profile error:', error); }
};

const printReceipt = orderId => {
    const receipt = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!receipt) return;
    const printable = receipt.cloneNode(true);
    printable.querySelectorAll('button').forEach(button => button.remove());
    const printWindow = window.open('', '_blank', 'width=700,height=700');
    printWindow.document.write(`<html><head><title>Receipt</title><link rel="stylesheet" href="${window.location.href.replace('receipts.html', 'receipts.css')}"></head><body class="print-body">${printable.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};

const downloadReceipt = orderId => {
    const receipt = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!receipt) return;
    const blob = new Blob([`<html><head><title>Receipt</title></head><body>${receipt.innerHTML}</body></html>`], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt-${orderId}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
};

const renderReceipts = orders => {
    const list = document.getElementById('receiptsList');
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
    const total = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    document.getElementById('totalSpent').textContent = formatPrice(total);
    document.getElementById('totalOrders').textContent = paidOrders.length;
    document.getElementById('averageOrder').textContent = formatPrice(paidOrders.length ? total / paidOrders.length : 0);

    if (!paidOrders.length) {
        list.innerHTML = '<div class="receipts-empty">No paid receipts yet.</div>';
        return;
    }

    list.innerHTML = paidOrders.map(order => {
        const receiptId = order.receiptId || order._id.slice(-8).toUpperCase();
        const orderId = order._id;
        const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        return `<article class="receipt-card" data-order-id="${orderId}">
            <div class="receipt-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg></div>
            <div class="receipt-info"><div class="receipt-title"><strong>#${receiptId}</strong><span>for #${receiptId.replace('RCP-', 'ORD-')}</span><b>PAID</b></div><div class="receipt-meta">${formatDate(order.createdAt)} <span>${itemCount} ${itemCount === 1 ? 'item' : 'items'}</span> <span>via ${order.paymentMethod || 'Paystack'}</span></div></div>
            <strong class="receipt-total">${formatPrice(order.total)}</strong>
            <div class="receipt-actions"><button type="button" title="Print receipt" data-action="print" data-order="${orderId}">▣</button><button type="button" class="pdf-button" data-action="download" data-order="${orderId}">⇩ PDF</button></div>
        </article>`;
    }).join('');
};

const loadReceipts = async () => {
    try {
        const response = await fetch(`${BASE}/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Unable to load receipts');
        renderReceipts(await response.json());
    } catch (error) {
        console.error('Receipts error:', error);
        document.getElementById('receiptsList').innerHTML = '<div class="receipts-empty">Unable to load receipts. Please try again.</div>';
    }
};

document.getElementById('cartBadge').textContent = getCartCount() || '';
document.getElementById('cartBadge').style.display = getCartCount() ? 'flex' : 'none';
document.getElementById('receiptsList').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'print') printReceipt(button.dataset.order);
    if (button.dataset.action === 'download') downloadReceipt(button.dataset.order);
});

updateAvatar();
loadReceipts();
