// src/pages/CheckoutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Import the new CheckoutPage.css
import './CheckoutPage.css';

function CheckoutPage() {
  const { cart, setCart } = useCart();

  const handleConfirmOrder = () => {
    alert("Thank you for your order! Your purchase has been confirmed.");
    setCart([]); // Clear the entire cart
  };

  const calculateItemCount = () => { // Renamed from calculateTotal to be more accurate
    let count = 0;
    cart.forEach(item => {
        count += item.quantity;
    });
    return count;
  };

  const itemCount = calculateItemCount();

  return (
    <div className="checkout-page-container"> {/* Use className */}
      <h2 className="checkout-page-title">Checkout</h2> {/* Use className */}
      {cart.length === 0 ? (
        <p className="empty-cart-checkout-message">Your cart is empty. Please add items before checking out.</p> 
      ) : (
        <>
          <p className="checkout-summary-text">
            You are about to purchase **{itemCount} item(s)**.
          </p>

          <button
            onClick={handleConfirmOrder}
            className="confirm-order-button"
          >
            Confirm Order
          </button>
        </>
      )}

      <p>
        <Link to="/cart" className="back-to-cart-link">&larr; Back to Cart</Link> {/* Use className */}
      </p>
    </div>
  );
}

export default CheckoutPage;