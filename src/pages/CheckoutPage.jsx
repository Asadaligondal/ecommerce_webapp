// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productsData from '../data/products';
import OrderConfirmationModal from '../components/orderconfirmation';

import './CheckoutPage.css';

const SHIPPING_FEE = 5.00;
// Define your backend URL
const BACKEND_URL = 'http://localhost:5000'; // Make sure this matches your backend server's port

function CheckoutPage() {
  const { cart, setCart } = useCart();

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    country: '',
    city: '',
    zipCode: '',
    phoneNumber: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState(null);
  // --- NEW STATE: Loading indicator ---
  const [isLoading, setIsLoading] = useState(false);
  // --- END NEW STATE ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!deliveryInfo.fullName.trim()) { errors.fullName = 'Full Name is required'; isValid = false; }
    if (!deliveryInfo.email.trim()) { errors.email = 'Email is required'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email)) { errors.email = 'Email address is invalid'; isValid = false; }
    if (!deliveryInfo.address.trim()) { errors.address = 'Address is required'; isValid = false; }
    if (!deliveryInfo.country.trim()) { errors.country = 'Country is required'; isValid = false; }
    if (!deliveryInfo.city.trim()) { errors.city = 'City is required'; isValid = false; }
    if (!deliveryInfo.zipCode.trim()) { errors.zipCode = 'Zip Code is required'; isValid = false; }
    if (!deliveryInfo.phoneNumber.trim()) { errors.phoneNumber = 'Phone Number is required'; isValid = false; }
    else if (!/^\+?[0-9\s-()]{7,20}$/.test(deliveryInfo.phoneNumber)) { errors.phoneNumber = 'Phone Number is invalid'; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

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

  // --- MODIFIED handleConfirmOrder function ---
  const handleConfirmOrder = async () => { // Make function async
    if (cart.length === 0) {
      alert("Your cart is empty. Cannot place an empty order.");
      return;
    }

    if (!validateForm()) {
      return; // Stop if form validation fails
    }

    setIsLoading(true); // Set loading state to true

    const orderDataToSend = {
        items: cart.map(item => {
            const product = productsData.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                name: product ? product.name : 'Unknown Product',
                quantity: item.quantity,
                price: product ? product.price : 0,
            };
        }),
        deliveryInfo: deliveryInfo,
        subtotal: subtotal,
        shipping: SHIPPING_FEE,
        grandTotal: grandTotal
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/place-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDataToSend),
        });

        if (!response.ok) {
            // If response is not OK (e.g., 400, 500 status)
            const errorData = await response.json(); // Try to parse error message from backend
            throw new Error(errorData.message || 'Failed to place order.');
        }

        const data = await response.json(); // Parse the JSON response from backend

        // Prepare details for the confirmation modal using data from backend
        const detailsForModal = {
            orderId: data.orderId, // Use the orderId sent from the backend
            email: deliveryInfo.email,
            totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
            grandTotal: grandTotal
        };

        setConfirmedOrderDetails(detailsForModal);
        setShowConfirmationModal(true);

        console.log("Order successfully placed. Backend response:", data);

    } catch (error) {
        console.error("Error placing order:", error);
        alert(`Order placement failed: ${error.message}`); // Show error to user
    } finally {
        setIsLoading(false); // Always set loading state to false after attempt
    }
  };
  // --- END MODIFIED handleConfirmOrder function ---

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    setConfirmedOrderDetails(null);
    setCart([]); // Clear the cart when the modal is closed
    setDeliveryInfo({
        fullName: '', email: '', address: '', country: '', city: '', zipCode: '', phoneNumber: ''
    });
    setFormErrors({});
  };

  return (
    <div className="checkout-page-container">
      <h2 className="checkout-page-title">Checkout Summary & Delivery</h2>

      {cart.length === 0 && !showConfirmationModal ? (
        <p className="empty-cart-checkout-message">Your cart is empty. Please add items before checking out.</p>
      ) : (
        <>
          <div className="delivery-info-form-section">
            <h3>Delivery Information</h3>
            <form className="delivery-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input type="text" id="fullName" name="fullName" value={deliveryInfo.fullName} onChange={handleChange} className={formErrors.fullName ? 'input-error' : ''} required />
                {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={deliveryInfo.email} onChange={handleChange} className={formErrors.email ? 'input-error' : ''} required />
                {formErrors.email && <p className="error-message">{formErrors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" name="address" value={deliveryInfo.address} onChange={handleChange} className={formErrors.address ? 'input-error' : ''} required />
                {formErrors.address && <p className="error-message">{formErrors.address}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="country">Country:</label>
                <input type="text" id="country" name="country" value={deliveryInfo.country} onChange={handleChange} className={formErrors.country ? 'input-error' : ''} required />
                {formErrors.country && <p className="error-message">{formErrors.country}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input type="text" id="city" name="city" value={deliveryInfo.city} onChange={handleChange} className={formErrors.city ? 'input-error' : ''} required />
                {formErrors.city && <p className="error-message">{formErrors.city}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code:</label>
                <input type="text" id="zipCode" name="zipCode" value={deliveryInfo.zipCode} onChange={handleChange} className={formErrors.zipCode ? 'input-error' : ''} required />
                {formErrors.zipCode && <p className="error-message">{formErrors.zipCode}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number:</label>
                <input type="text" id="phoneNumber" name="phoneNumber" value={deliveryInfo.phoneNumber} onChange={handleChange} className={formErrors.phoneNumber ? 'input-error' : ''} required />
                {formErrors.phoneNumber && <p className="error-message">{formErrors.phoneNumber}</p>}
              </div>
            </form>
          </div>

          <div className="order-summary-list">
            <h3>Items in your order:</h3>
            <ul>
              {cart.map(cartItem => {
                const product = productsData.find(p => p.id === cartItem.productId);
                if (!product) return null;

                return (
                  <li key={cartItem.productId} className="summary-item">
                    <span>{product.name} (x{cartItem.quantity})</span>
                    <span>${(product.price * cartItem.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="order-totals-breakdown">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Shipping:</span>
              <span>${SHIPPING_FEE.toFixed(2)}</span>
            </div>
            <div className="total-line grand-total">
              <span>Grand Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmOrder}
            className="confirm-order-button"
            disabled={isLoading || cart.length === 0} /* Disable button when loading or cart is empty */
          >
            {isLoading ? 'Processing Order...' : 'Confirm Order'} {/* Dynamic button text */}
          </button>
        </>
      )}

      <p>
        <Link to="/cart" className="back-to-cart-link">&larr; Back to Cart</Link>
      </p>

      <OrderConfirmationModal
        show={showConfirmationModal}
        onClose={handleCloseModal}
        orderDetails={confirmedOrderDetails}
      />
    </div>
  );
}

export default CheckoutPage;