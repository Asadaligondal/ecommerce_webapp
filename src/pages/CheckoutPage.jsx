// src/pages/CheckoutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// Removed useAuth as per your request to not use authorization for this feature.
import productsData from '../data/products'; // Import productsData

import './CheckoutPage.css';

// Define a constant for shipping fee
const SHIPPING_FEE = 5.00; // Example shipping fee

function CheckoutPage() {
  const { cart, setCart } = useCart();
  // const { user, isAuthenticated, placeOrder } = useAuth(); // Removed useAuth for this feature

  // Calculate the subtotal of items in the cart
  const calculateSubtotal = () => {
    let total = 0;
    cart.forEach(cartItem => {
      const product = productsData.find(p => p.id === cartItem.productId);
      if (product) {
        total += product.price * cartItem.quantity;
      }
    });
    return total;
  };

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + SHIPPING_FEE;

  const handleConfirmOrder = () => {
    // No authentication check for this feature as per your request.
    // if (!isAuthenticated) {
    //   alert("Please log in to place an order.");
    //   return;
    // }

    if (cart.length === 0) {
      alert("Your cart is empty. Cannot place an empty order.");
      return;
    }

    // In a real application, you would send this order details to a backend.
    // For now, we simulate order placement and clear the cart.
    alert(`Order Confirmed!\nTotal: $${grandTotal.toFixed(2)}\nThank you for your purchase!`);
    console.log("Order Details:", {
        items: cart.map(item => {
            const product = productsData.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product ? product.name : 'Unknown Product',
                quantity: item.quantity,
                price: product ? product.price : 0,
                lineTotal: product ? (product.price * item.quantity) : 0
            };
        }),
        subtotal: subtotal.toFixed(2),
        shipping: SHIPPING_FEE.toFixed(2),
        grandTotal: grandTotal.toFixed(2)
    });

    setCart([]); // Clear the cart after "successful" order placement
  };

  return (
    <div className="checkout-page-container">
      <h2 className="checkout-page-title">Checkout Summary</h2> {/* Changed title */}

      {/* Removed login prompt message as per your request */}
      {/* {!isAuthenticated && (
        <p className="login-prompt-message">
          You are not logged in. <Link to="/login">Log in</Link> to view your order history later.
        </p>
      )} */}

      {cart.length === 0 ? (
        <p className="empty-cart-checkout-message">Your cart is empty. Please add items before checking out.</p>
      ) : (
        <>
          <div className="order-summary-list"> {/* New container for the list */}
            <h3>Items in your order:</h3>
            <ul>
              {cart.map(cartItem => {
                const product = productsData.find(p => p.id === cartItem.productId);
                if (!product) return null; // Should not happen if data is consistent

                return (
                  <li key={cartItem.productId} className="summary-item"> {/* New class for each item */}
                    <span>{product.name} (x{cartItem.quantity})</span>
                    <span>${(product.price * cartItem.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="order-totals-breakdown"> {/* New container for totals */}
            <div className="total-line">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Shipping:</span>
              <span>${SHIPPING_FEE.toFixed(2)}</span>
            </div>
            <div className="total-line grand-total"> {/* New class for grand total */}
              <span>Grand Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmOrder}
            className="confirm-order-button"
          >
            Confirm Order
          </button>
        </>
      )}

      <p>
        <Link to="/cart" className="back-to-cart-link">&larr; Back to Cart</Link>
      </p>
    </div>
  );
}

export default CheckoutPage;