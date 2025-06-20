// src/pages/CartPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
console.log("Cart contents:", cart);
console.log("Cart length:", cart.length);
cart.forEach((item, index) => {
  console.log(`Cart item ${index}:`, {
    productId: item.productId,
    price: item.price,
    quantity: item.quantity,
    priceType: typeof item.price
  });
});

console.log("getTotalPrice result:", getTotalPrice());
  // DEBUG: Remove these console.logs after fixing
  console.log("Cart contents:", cart);
  console.log("Cart length:", cart.length);

  const subtotal = getTotalPrice();

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is currently empty. Start shopping!</p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map(cartItem => {
                // Additional safety checks
                if (!cartItem || !cartItem.productId) {
                  console.warn("Invalid cart item:", cartItem);
                  return null;
                }

                return (
                  <div key={cartItem.productId} className="cart-item">
                    <Link to={`/products/${cartItem.productId}`} className="cart-item-link">
                      <img 
                        src={cartItem.imageUrl || '/placeholder-image.jpg'} 
                        alt={cartItem.name || 'Product'} 
                        className="cart-item-image"
                      />
                    </Link>
                    
                    <div className="cart-item-details">
                      <Link to={`/products/${cartItem.productId}`}>
                        <h3>{cartItem.name || 'Unknown Product'}</h3>
                      </Link>
                      <p>Price: ${cartItem.price ? cartItem.price.toFixed(2) : '0.00'}</p>
                    </div>

                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(cartItem.productId, -1)}
                        className="quantity-button"
                        disabled={cartItem.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{cartItem.quantity || 0}</span>
                      <button 
                        onClick={() => updateQuantity(cartItem.productId, 1)}
                        className="quantity-button primary"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      <strong>
                        ${((cartItem.price || 0) * (cartItem.quantity || 0)).toFixed(2)}
                      </strong>
                    </div>

                    <button 
                      onClick={() => removeFromCart(cartItem.productId)}
                      className="remove-item-button"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3>Subtotal: ${subtotal.toFixed(2)}</h3>
              <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;