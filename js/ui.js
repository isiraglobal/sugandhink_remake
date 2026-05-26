import { products } from './products.js';

document.addEventListener('DOMContentLoaded', () => {
    const shopBtn = document.getElementById('toggle-shop');
    const shopDrawer = document.getElementById('shop-drawer');
    const closeDrawer = document.getElementById('close-drawer');
    const productList = document.getElementById('drawer-product-list');

    // Populate Products
    if (productList) {
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'drawer-product-item';
            item.innerHTML = `
                <div class="item-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="item-image">
                </div>
                <div class="item-details">
                    <div class="item-code">${product.code}</div>
                    <h4>${product.name}</h4>
                    <p class="item-notes">${product.notes}</p>
                    <p class="item-memory">"${product.memory}"</p>
                </div>
                <div class="item-price">${product.price}</div>
                <button class="add-to-cart-btn">ADD</button>
            `;
            productList.appendChild(item);
        });
    }

    // Drawer Toggles
    shopBtn.addEventListener('click', () => {
        shopDrawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    });

    closeDrawer.addEventListener('click', () => {
        shopDrawer.classList.remove('is-open');
        document.body.style.overflow = 'auto';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (shopDrawer.classList.contains('is-open') && !shopDrawer.contains(e.target) && e.target !== shopBtn) {
            shopDrawer.classList.remove('is-open');
            document.body.style.overflow = 'auto';
        }
    });
});
