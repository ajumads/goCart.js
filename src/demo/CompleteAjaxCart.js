import './scss/CompleteAjaxCart.scss';
import {formatMoney} from '@shopify/theme-currency/currency';
import 'whatwg-fetch';
import serialize from 'form-serialize';

class CompleteAjaxCart {

    constructor(options) {

        const defaults = {
            cartModalFail: '.js-ajax-cart-modal-fail',
            cartModalFailClose: '.js-ajax-cart-modal-fail-close',
            cartModal: '.js-ajax-cart-modal',
            cartModalClose: '.js-ajax-cart-modal-close',
            cartModalContent: '.js-ajax-cart-modal-content',
            cartDrawer: '.js-ajax-cart-drawer',
            cartDrawerContent: '.js-ajax-cart-drawer-content',
            cartDrawerSubTotal: '.js-ajax-cart-drawer-subtotal',
            cartDrawerFooter: '.js-ajax-drawer-footer',
            cartDrawerClose: '.js-ajax-cart-drawer-close',
            cartMiniCart: '.js-ajax-mini-cart',
            cartMiniCartContent: '.js-ajax-mini-cart-content',
            cartMiniCartSubTotal: '.js-ajax-mini-cart-subtotal',
            cartMiniCartFooter: '.js-ajax-mini-cart-footer',
            cartTrigger: '.js-ajax-cart-trigger',
            cartOverlay: '.js-ajax-cart-overlay',
            cartCount: '.js-ajax-cart-counter',
            addToCart: '.js-ajax-add-to-cart',
            removeFromCart: '.js-ajax-remove-from-cart',
            removeFromCartNoDot: 'js-ajax-remove-from-cart',
            itemQuantity: '.js-ajax-cart-quantity',
            itemQuantityPlus: '.js-ajax-cart-quantity-plus',
            itemQuantityMinus: '.js-ajax-cart-quantity-minus',
            bodyClass: 'is-overlay-opened',
            cartMode: 'drawer',
            drawerDirection: 'right',
            displayModal: false,
        };

        this.defaults = Object.assign({}, defaults, options);

        this.cartModalFail = document.querySelector(this.defaults.cartModalFail);
        this.cartModalFailClose = document.querySelector(this.defaults.cartModalFailClose);
        this.cartModal = document.querySelector(this.defaults.cartModal);
        this.cartModalClose = document.querySelectorAll(this.defaults.cartModalClose);
        this.cartModalContent = document.querySelector(this.defaults.cartModalContent);
        this.cartDrawer = document.querySelector(this.defaults.cartDrawer);
        this.cartDrawerContent = document.querySelector(this.defaults.cartDrawerContent);
        this.cartDrawerSubTotal = document.querySelector(this.defaults.cartDrawerSubTotal);
        this.cartDrawerFooter = document.querySelector(this.defaults.cartDrawerFooter);
        this.cartDrawerClose = document.querySelector(this.defaults.cartDrawerClose);
        this.cartMiniCart = document.querySelector(this.defaults.cartMiniCart);
        this.cartMiniCartContent = document.querySelector(this.defaults.cartMiniCartContent);
        this.cartMiniCartSubTotal = document.querySelector(this.defaults.cartMiniCartSubTotal);
        this.cartMiniCartFooter = document.querySelector(this.defaults.cartMiniCartFooter);
        this.cartTrigger = document.querySelector(this.defaults.cartTrigger);
        this.cartOverlay = document.querySelector(this.defaults.cartOverlay);
        this.cartCount = document.querySelector(this.defaults.cartCount);
        this.addToCart = document.querySelectorAll(this.defaults.addToCart);
        this.removeFromCart = this.defaults.removeFromCart;
        this.removeFromCartNoDot = this.defaults.removeFromCartNoDot;
        this.itemQuantity = this.defaults.itemQuantity;
        this.itemQuantityPlus = this.defaults.itemQuantityPlus;
        this.itemQuantityMinus = this.defaults.itemQuantityMinus;
        this.bodyClass = this.defaults.bodyClass;
        this.cartMode = this.defaults.cartMode;
        this.drawerDirection = this.defaults.drawerDirection;
        this.displayModal = this.defaults.displayModal;

        this.init();

    }

    init() {

        this.fetchCart();

        if (this.cartMode === 'drawer') {
            this.setDrawerDirection();
        }

        this.addToCart.forEach((item) => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                const formID = item.parentNode.getAttribute('id');
                this.addItemToCart(formID);
            });
        });

        this.cartTrigger.addEventListener('click', () => {
            if (this.cartMode === 'drawer') {
                this.openCartDrawer();
            } else {
                this.openMiniCart();
            }
            this.openCartOverlay();
        });

        this.cartOverlay.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartModal();
            if (this.cartMode === 'drawer') {
                this.closeCartDrawer();
            } else {
                this.closeMiniCart();
            }
            this.closeCartOverlay();
        });

        if (this.cartMode === 'drawer') {
            this.cartDrawerClose.addEventListener('click', () => {
                this.closeCartDrawer();
                this.closeCartOverlay();
            });
        }

        if (this.displayModal) {
            this.cartModalClose.forEach((item) => {
                item.addEventListener('click', () => {
                    this.closeFailModal();
                    this.closeCartModal();
                    if (this.cartMode === 'drawer') {
                        this.closeCartDrawer();
                    } else {
                        this.closeMiniCart();
                    }
                    this.closeCartOverlay();
                });
            });
        }

        this.cartModalFailClose.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartModal();
            if (this.cartMode === 'drawer') {
                this.closeCartDrawer();
            } else {
                this.closeMiniCart();
            }
            this.closeCartOverlay();
        });

    }

    fetchCart(callback) {
        window.fetch('/cart.js', {
            credentials: 'same-origin',
            method: 'GET',
        })
            .then((response) => response.json())
            .then((cart) => this.fetchHandler(cart, callback))
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    addItemToCart(formID) {
        const form = document.querySelector(`#${formID}`);
        const formData = serialize(form, {hash: true});
        window.fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((product) => this.addItemToCartHandler(product))
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    removeItem(line) {
        const quantity = 0;
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then(() => this.fetchCart())
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    changeItemQuantity(line, quantity) {
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then(() => this.fetchCart())
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    cartItemCount(cart) {
        this.cartCount.innerHTML = cart.item_count;
    }

    fetchAndOpenCart() {
        this.fetchCart(() => {
            if (this.cartMode === 'drawer') {
                this.openCartDrawer();
            } else {
                this.openMiniCart();
            }
            this.openCartOverlay();
        });
    }

    fetchAndOpenModal(product) {
        this.fetchCart(() => {
            this.renderCartModal(product);
            this.openCartModal();
            this.openCartOverlay();
        });
    }

    fetchHandler(cart, callback) {
        this.cartItemCount(cart);
        if (this.cartMode === 'drawer') {
            if (cart.item_count === 0) {
                this.renderBlankCartDrawer();
                this.cartDrawerFooter.classList.add('is-invisible');
            } else {
                this.renderDrawerCart(cart);
                this.cartDrawerFooter.classList.remove('is-invisible');
                if ((typeof callback) === 'function') {
                    callback(cart);
                }
            }
        } else if (cart.item_count === 0) {
            this.renderBlankMiniCart();
            this.cartMiniCartFooter.classList.add('is-invisible');
        } else {
            this.renderMiniCart(cart);
            this.cartMiniCartFooter.classList.remove('is-invisible');
            if ((typeof callback) === 'function') {
                callback(cart);
            }
        }
    }

    addItemToCartHandler(product) {
        return this.displayModal ? this.fetchAndOpenModal(product) : this.fetchAndOpenCart();
    }

    ajaxRequestFail() {
        this.openFailModal();
        this.openCartOverlay();
    }

    renderCartModal(product) {
        this.clearCartModal();
        let productVariant = product.variant_title;
        if (productVariant === null) {
            productVariant = '';
        } else {
            productVariant = `(${productVariant})`;
        }
        const cartSingleProduct = `
        <div class="ajax-cart-modal-item">
            <div class="ajax-cart-item__image" style="background-image: url(${product.image});"></div>
            <div class="ajax-cart-item__info">
                <a href="${product.url}" class="ajax-cart-item__title">${product.product_title} ${productVariant}</a> was added to your cart.
            </div>
        </div>
      `;
        this.cartModalContent.innerHTML += cartSingleProduct;
    }

    renderDrawerCart(cart) {
        this.clearCartDrawer();
        cart.items.forEach((item, index) => {
            let itemVariant = item.variant_title;
            if (itemVariant === null) {
                itemVariant = '';
            }
            const cartSingleProduct = `
        <div class="ajax-cart-item__single" data-line="${Number(index + 1)}">
            <div class="ajax-cart-item__info-wrapper">
                <div class="ajax-cart-item__image" style="background-image: url(${item.image});"></div>
                <div class="ajax-cart-item__info">
                    <a href="${item.url}" class="ajax-cart-item__title">${item.product_title}</a>
                    <div class="ajax-cart-item__variant">${itemVariant}</div>
                    <div class="ajax-cart-item__quantity">
                        <span class="ajax-cart-item__quantity-label">Quantity: </span>
                        <span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-minus">-</span>
                        <input class="ajax-cart-item__quantity-number js-ajax-cart-quantity" type="number" value="${item.quantity}" disabled>
                        <span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-plus">+</span>
                    </div>
                </div>
            </div>
            <div class="ajax-cart-item__price">${formatMoney(item.line_price)}</div>
            <a class="ajax-cart-item__remove ${this.removeFromCartNoDot}">Remove</a>
        </div>
      `;
            this.cartDrawerContent.innerHTML += cartSingleProduct;
        });
        this.cartDrawerSubTotal.innerHTML = formatMoney(cart.total_price);
        this.cartDrawerSubTotal.parentNode.classList.remove('is-invisible');
        const removeFromCart = document.querySelectorAll(this.removeFromCart);
        removeFromCart.forEach((item) => {
            item.addEventListener('click', () => {
                CompleteAjaxCart.removeItemAnimation(item.parentNode);
                const line = item.parentNode.getAttribute('data-line');
                this.removeItem(line);
            });
        });
        const itemQuantityPlus = document.querySelectorAll(this.itemQuantityPlus);
        itemQuantityPlus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) + 1;
                this.changeItemQuantity(line, quantity);
            });
        });
        const itemQuantityMinus = document.querySelectorAll(this.itemQuantityMinus);
        itemQuantityMinus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) - 1;
                this.changeItemQuantity(line, quantity);
                if (Number((item.parentNode.querySelector(this.itemQuantity).value - 1)) === 0) {
                    CompleteAjaxCart.removeItemAnimation(item.parentNode.parentNode.parentNode.parentNode);
                }
            });
        });
    }

    renderMiniCart(cart) {
        this.clearMiniCart();
        cart.items.forEach((item, index) => {
            let itemVariant = item.variant_title;
            if (itemVariant === null) {
                itemVariant = '';
            }
            const cartSingleProduct = `
        <div class="ajax-cart-item__single" data-line="${Number(index + 1)}">
            <div class="ajax-cart-item__info-wrapper">
                <div class="ajax-cart-item__image" style="background-image: url(${item.image});"></div>
                <div class="ajax-cart-item__info">
                    <a href="${item.url}" class="ajax-cart-item__title">${item.product_title}</a>
                    <div class="ajax-cart-item__variant">${itemVariant}</div>
                    <div class="ajax-cart-item__quantity">
                        <span class="ajax-cart-item__quantity-label">Quantity: </span>
                        <span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-minus">-</span>
                        <input class="ajax-cart-item__quantity-number js-ajax-cart-quantity" type="number" value="${item.quantity}" disabled>
                        <span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-plus">+</span>
                    </div>
                </div>
            </div>
            <div class="ajax-cart-item__price">${formatMoney(item.line_price)}</div>
            <a class="ajax-cart-item__remove ${this.removeFromCartNoDot}">Remove</a>
        </div>
      `;
            this.cartMiniCartContent.innerHTML += cartSingleProduct;
        });
        this.cartMiniCartSubTotal.innerHTML = formatMoney(cart.total_price);
        this.cartMiniCartSubTotal.parentNode.classList.remove('is-invisible');
        const removeFromCart = document.querySelectorAll(this.removeFromCart);
        removeFromCart.forEach((item) => {
            item.addEventListener('click', () => {
                CompleteAjaxCart.removeItemAnimation(item.parentNode);
                const line = item.parentNode.getAttribute('data-line');
                this.removeItem(line);
            });
        });
        const itemQuantityPlus = document.querySelectorAll(this.itemQuantityPlus);
        itemQuantityPlus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) + 1;
                this.changeItemQuantity(line, quantity);
            });
        });
        const itemQuantityMinus = document.querySelectorAll(this.itemQuantityMinus);
        itemQuantityMinus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) - 1;
                this.changeItemQuantity(line, quantity);
                if (Number((item.parentNode.querySelector(this.itemQuantity).value - 1)) === 0) {
                    CompleteAjaxCart.removeItemAnimation(item.parentNode.parentNode.parentNode.parentNode);
                }
            });
        });
    }

    renderBlankCartDrawer() {
        this.cartDrawerSubTotal.parentNode.classList.add('is-invisible');
        this.clearCartDrawer();
        this.cartDrawerContent.innerHTML = '<div class="ajax-cart__empty">Your Cart is currenty empty!</div>';
    }

    renderBlankMiniCart() {
        this.cartMiniCartSubTotal.parentNode.classList.add('is-invisible');
        this.clearMiniCart();
        this.cartMiniCartContent.innerHTML = '<div class="ajax-cart__empty">Your Cart is currenty empty!</div>';
    }

    clearCartDrawer() {
        this.cartDrawerContent.innerHTML = '';
    }

    clearMiniCart() {
        this.cartMiniCartContent.innerHTML = '';
    }

    clearCartModal() {
        this.cartModalContent.innerHTML = '';
    }

    openCartDrawer() {
        this.cartDrawer.classList.add('is-open');
    }

    closeCartDrawer() {
        this.cartDrawer.classList.remove('is-open');
    }

    openMiniCart() {
        this.cartMiniCart.classList.add('is-open');
    }

    closeMiniCart() {
        this.cartMiniCart.classList.remove('is-open');
    }

    openFailModal() {
        this.cartModalFail.classList.add('is-open');
    }

    closeFailModal() {
        this.cartModalFail.classList.remove('is-open');
    }

    openCartModal() {
        this.cartModal.classList.add('is-open');
    }

    closeCartModal() {
        this.cartModal.classList.remove('is-open');
    }

    openCartOverlay() {
        this.cartOverlay.classList.add('is-open');
    }

    closeCartOverlay() {
        this.cartOverlay.classList.remove('is-open');
    }

    static removeItemAnimation(item) {
        item.classList.add('is-invisible');
    }

    setDrawerDirection() {
        this.cartDrawer.classList.add(`ajax-cart__drawer--${this.drawerDirection}`);
    }

}

export default CompleteAjaxCart;
