// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartCountElements = document.querySelectorAll('.cart-count');
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartSummaryElement = document.getElementById('cartSummary');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
function init() {
    updateCartCount();
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const productId = urlParams.get('id');

    if (searchQuery && filterBtns.length > 0) {
        document.querySelectorAll('.search-input').forEach(input => input.value = searchQuery);
        const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
        renderProducts(filtered);
    } else if (productId && window.location.pathname.includes('product.html')) {
        renderProductDetail(productId);
    } else if (productsGrid) {
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('ecommerce-site/');
        const displayProducts = isIndex ? products.slice(0, 4) : products;
        renderProducts(displayProducts);
    }
    
    if (cartItemsContainer) {
        renderCart();
    }
    
    document.querySelectorAll('#searchForm').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = form.querySelector('.search-input').value;
            window.location.href = 'shop.html?search=' + encodeURIComponent(val);
        });
    });

    if (filterBtns.length > 0) {
        setupFilters();
    }
}

// Render Products
function renderProducts(productsToRender) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card glass';
        card.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-img-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            <div class="product-info">
                <div>
                    <div class="product-category">${product.category}</div>
                    <a href="product.html?id=${product.id}" class="product-title" style="display:block;">${product.name}</a>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">${product.description}</p>
                </div>
                <div class="product-footer">
                    <div class="product-price">ETB Birr ${product.price}</div>
                    <button class="add-to-cart" onclick="addToCart('${product.id}')" aria-label="Add ${product.name} to cart">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Filters
function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-filter');
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    });
}

// Render Product Details
function renderProductDetail(productId) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const product = products.find(p => p.id === productId);
    if (!product) {
        container.innerHTML = `<h2 style="text-align: center;">Product not found :(</h2>`;
        return;
    }

    const stars = `★★★★☆`;

    container.innerHTML = `
        <div class="pdp-grid">
            <div class="pdp-image-container glass">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="pdp-content">
                <div class="product-category">${product.category}</div>
                <h1>${product.name}</h1>
                <div class="pdp-reviews">
                    ${stars} <span>(128 Reviews)</span>
                </div>
                <div class="pdp-price">ETB Birr ${product.price}</div>
                <p class="pdp-description">${product.description} Experience the next generation of premium tech, crafted meticulously to meet the dynamic needs of modern enthusiasts. Don't compromise on quality.</p>
                
                <div class="pdp-actions">
                    <div class="pdp-qty glass">
                        <button class="pdp-qty-btn" onclick="const qty = document.getElementById('pdpQty'); qty.value = Math.max(1, parseInt(qty.value) - 1);">-</button>
                        <input type="text" id="pdpQty" class="pdp-qty-input" value="1" readonly>
                        <button class="pdp-qty-btn" onclick="const qty = document.getElementById('pdpQty'); qty.value = parseInt(qty.value) + 1;">+</button>
                    </div>
                    <button class="btn btn-primary" onclick="addMultipleToCart('${product.id}', parseInt(document.getElementById('pdpQty').value))">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addMultipleToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showToast('Added ' + quantity + ' ' + product.name + '(s) to cart');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(`Added ${product.name} to cart`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    if (cartItemsContainer) renderCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        if (cartItemsContainer) renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.innerText = totalItems;
        // Pulse animation
        el.style.transform = 'scale(1.2)';
        setTimeout(() => el.style.transform = 'scale(1)', 200);
    });
}

function renderCart() {
    if (!cartItemsContainer || !cartSummaryElement) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-msg">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 1rem; color: var(--text-muted);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <h3>Your cart is empty</h3>
                <p style="margin-top: 1rem;"><a href="shop.html" class="btn btn-primary" style="padding: 0.5rem 1.5rem;">Continue Shopping</a></p>
            </div>
        `;
        cartSummaryElement.innerHTML = '';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemTotal = item.price * item.quantity;
        
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="product-category">${item.category}</div>
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">ETB Birr ${item.price}</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div style="font-weight: 600; width: 80px; text-align: right;">ETB Birr ${itemTotal}</div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        cartItemsContainer.appendChild(el);
    });
    
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    cartSummaryElement.innerHTML = `
        <h3 style="margin-bottom: 1.5rem;">Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal</span>
            <span>ETB Birr ${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Estimated Tax (8%)</span>
            <span>ETB Birr ${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>ETB Birr ${total.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="checkout()">Proceed to Checkout</button>
    `;
}

// Toast Notification
function showToast(message) {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        ${message}
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 300);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function checkout() {
    window.location.href = 'checkout.html';
}

// Run init on load
document.addEventListener('DOMContentLoaded', init);
